const pool = require("../db");

const indexes = [
  {
    name: "idx_rets_property_city",
    sql: "CREATE INDEX idx_rets_property_city ON rets_property (L_City)",
  },
  {
    name: "idx_rets_property_zip",
    sql: "CREATE INDEX idx_rets_property_zip ON rets_property (L_Zip)",
  },
  {
    name: "idx_rets_property_price",
    sql: "CREATE INDEX idx_rets_property_price ON rets_property (L_SystemPrice)",
  },
  {
    name: "idx_rets_property_beds",
    sql: "CREATE INDEX idx_rets_property_beds ON rets_property (L_Keyword2)",
  },
  {
    name: "idx_rets_property_baths",
    sql: "CREATE INDEX idx_rets_property_baths ON rets_property (LM_Dec_3)",
  },
];

async function indexExists(indexName) {
  const [rows] = await pool.query(
    `SELECT 1
     FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'rets_property'
       AND INDEX_NAME = ?
     LIMIT 1`,
    [indexName]
  );

  return rows.length > 0;
}

async function main() {
  await pool.query(
    `SET SESSION sql_mode = REPLACE(
       REPLACE(@@SESSION.sql_mode, 'NO_ZERO_DATE', ''),
       'NO_ZERO_IN_DATE',
       ''
     )`
  );

  for (const index of indexes) {
    if (await indexExists(index.name)) {
      console.log(`exists: ${index.name}`);
      continue;
    }

    await pool.query(index.sql);
    console.log(`created: ${index.name}`);
  }

  const [currentIndexes] = await pool.query("SHOW INDEXES FROM rets_property");
  console.table(
    currentIndexes.map((index) => ({
      Key_name: index.Key_name,
      Column_name: index.Column_name,
      Non_unique: index.Non_unique,
    }))
  );

  const [explainRows] = await pool.query(
    `EXPLAIN
     SELECT *
     FROM rets_property
     WHERE L_City = ?
       AND L_SystemPrice >= ?
       AND L_Keyword2 = ?
     ORDER BY id ASC
     LIMIT 20 OFFSET 0`,
    ["Portland", 300000, 3]
  );

  console.table(explainRows);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
