const assert = require("node:assert/strict");
const test = require("node:test");

const { _test } = require("./properties");

test("buildPropertyQuery keeps count values separate from pagination values", () => {
  const filters = _test.validateQuery({
    minPrice: "300000",
    beds: "3",
    limit: "10",
    offset: "20",
  });

  const query = _test.buildPropertyQuery(filters);

  assert.equal(
    query.countSql,
    "SELECT COUNT(*) AS total FROM rets_property WHERE L_SystemPrice >= ? AND L_Keyword2 = ?"
  );
  assert.deepEqual(query.countValues, [300000, 3]);
  assert.deepEqual(query.resultsValues, [300000, 3, 10, 20]);
});

test("validateQuery rejects invalid pagination and numeric filters", () => {
  assert.throws(() => _test.validateQuery({ limit: "0" }), /limit/);
  assert.throws(() => _test.validateQuery({ limit: "200" }), /limit/);
  assert.throws(() => _test.validateQuery({ minPrice: "abc" }), /minPrice/);
});
