const express = require("express");
const pool = require("../db");

const router = express.Router();

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const MAX_LISTING_ID_LENGTH = 20;

const ALLOWED_QUERY_PARAMS = new Set([
  "city",
  "zipcode",
  "minPrice",
  "maxPrice",
  "beds",
  "baths",
  "limit",
  "offset",
]);

function parsePositiveInteger(value, name, { min = 0, max } = {}) {
  if (value === undefined) {
    return undefined;
  }

  if (!/^\d+$/.test(String(value))) {
    throw new Error(`${name} must be a whole number`);
  }

  const parsed = Number(value);

  if (parsed < min) {
    throw new Error(`${name} must be at least ${min}`);
  }

  if (max !== undefined && parsed > max) {
    throw new Error(`${name} must be no more than ${max}`);
  }

  return parsed;
}

function parseNonNegativeNumber(value, name) {
  if (value === undefined) {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${name} must be a non-negative number`);
  }

  return parsed;
}

function parseRequiredText(value, name) {
  if (value === undefined) {
    return undefined;
  }

  const parsed = String(value).trim();

  if (!parsed) {
    throw new Error(`${name} cannot be empty`);
  }

  return parsed;
}

function validateListingId(value) {
  const listingId = String(value ?? "").trim();

  if (!/^\d+$/.test(listingId)) {
    throw new Error("listing ID must contain only digits");
  }

  if (listingId.length > MAX_LISTING_ID_LENGTH) {
    throw new Error(
      `listing ID must be ${MAX_LISTING_ID_LENGTH} digits or fewer`
    );
  }

  return listingId;
}

function validateQuery(query) {
  const unknownParams = Object.keys(query).filter(
    (key) => !ALLOWED_QUERY_PARAMS.has(key)
  );

  if (unknownParams.length > 0) {
    throw new Error(`Unsupported query parameter: ${unknownParams.join(", ")}`);
  }

  const limit =
    parsePositiveInteger(query.limit, "limit", {
      min: 1,
      max: MAX_LIMIT,
    }) ?? DEFAULT_LIMIT;
  const offset =
    parsePositiveInteger(query.offset, "offset", { min: 0 }) ?? 0;

  const minPrice = parseNonNegativeNumber(query.minPrice, "minPrice");
  const maxPrice = parseNonNegativeNumber(query.maxPrice, "maxPrice");

  if (
    minPrice !== undefined &&
    maxPrice !== undefined &&
    minPrice > maxPrice
  ) {
    throw new Error("minPrice must be less than or equal to maxPrice");
  }

  return {
    city: parseRequiredText(query.city, "city"),
    zipcode: parseRequiredText(query.zipcode, "zipcode"),
    minPrice,
    maxPrice,
    beds: parsePositiveInteger(query.beds, "beds", { min: 0 }),
    baths: parseNonNegativeNumber(query.baths, "baths"),
    limit,
    offset,
  };
}

async function findPropertyByListingId(listingId) {
  const [rows] = await pool.query(
    "SELECT * FROM rets_property WHERE L_ListingID = ? LIMIT 1",
    [listingId]
  );

  return rows[0];
}

function buildPropertyQuery(filters) {
  const whereClauses = [];
  const filterValues = [];

  if (filters.city !== undefined) {
    whereClauses.push("L_City = ?");
    filterValues.push(filters.city);
  }

  if (filters.zipcode !== undefined) {
    whereClauses.push("L_Zip = ?");
    filterValues.push(filters.zipcode);
  }

  if (filters.minPrice !== undefined) {
    whereClauses.push("L_SystemPrice >= ?");
    filterValues.push(filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    whereClauses.push("L_SystemPrice <= ?");
    filterValues.push(filters.maxPrice);
  }

  if (filters.beds !== undefined) {
    whereClauses.push("L_Keyword2 = ?");
    filterValues.push(filters.beds);
  }

  if (filters.baths !== undefined) {
    whereClauses.push("LM_Dec_3 = ?");
    filterValues.push(filters.baths);
  }

  const whereSql =
    whereClauses.length > 0 ? ` WHERE ${whereClauses.join(" AND ")}` : "";

  return {
    countSql: `SELECT COUNT(*) AS total FROM rets_property${whereSql}`,
    countValues: [...filterValues],
    resultsSql: `SELECT * FROM rets_property${whereSql} ORDER BY id ASC LIMIT ? OFFSET ?`,
    resultsValues: [...filterValues, filters.limit, filters.offset],
  };
}

router.get("/:id/openhouses", async (req, res) => {
  let listingId;

  try {
    listingId = validateListingId(req.params.id);
  } catch (error) {
    return res.status(400).json({
      error: "Invalid listing ID",
      message: error.message,
    });
  }

  try {
    const property = await findPropertyByListingId(listingId);

    if (!property) {
      return res.status(404).json({
        error: "Property not found",
        message: `No property found for listing ID ${listingId}`,
      });
    }

    const [openhouses] = await pool.query(
      `SELECT *
       FROM rets_openhouse
       WHERE L_ListingID = ?
       ORDER BY OpenHouseDate ASC, OH_StartTime ASC`,
      [listingId]
    );

    return res.status(200).json(openhouses);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch open houses",
      message: error.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  let listingId;

  try {
    listingId = validateListingId(req.params.id);
  } catch (error) {
    return res.status(400).json({
      error: "Invalid listing ID",
      message: error.message,
    });
  }

  try {
    const property = await findPropertyByListingId(listingId);

    if (!property) {
      return res.status(404).json({
        error: "Property not found",
        message: `No property found for listing ID ${listingId}`,
      });
    }

    return res.status(200).json(property);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch property",
      message: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  let filters;

  try {
    filters = validateQuery(req.query);
  } catch (error) {
    return res.status(400).json({
      error: "Invalid query parameters",
      message: error.message,
    });
  }

  const { countSql, countValues, resultsSql, resultsValues } =
    buildPropertyQuery(filters);

  try {
    const [[countRow]] = await pool.query(countSql, countValues);
    const [results] = await pool.query(resultsSql, resultsValues);

    return res.status(200).json({
      total: Number(countRow.total),
      limit: filters.limit,
      offset: filters.offset,
      results,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch properties",
      message: error.message,
    });
  }
});

module.exports = router;
module.exports._test = {
  buildPropertyQuery,
  validateListingId,
  validateQuery,
};
