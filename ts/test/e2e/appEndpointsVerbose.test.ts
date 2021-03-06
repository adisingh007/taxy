import { server } from '../../src/server'; 
import { getTaxyRoutes } from '../../src/routes/taxy';
import supertest from 'supertest';

describe("Upon requesting for /getTaxAmount in verbose mode", () => {

    const taxySupertest = supertest(server);
    server.use("/", getTaxyRoutes());

    describe("error cases", () => {
        test("should return 404 with unexpected regime name", async () => {
            const regimeName = "unknown";
            const response = await taxySupertest.get(`/getTaxAmount/${regimeName}/600000?verbose=true`);
            expect(response.status).toBe(404);
            expect(response.text).toBe(`No such regime ${regimeName}!`);
        });
    
        test("should return 404 with no regime name", async () => {
            const response = await taxySupertest.get(`/getTaxAmount/600000?verbose=true`);
            expect(response.status).toBe(404);
        });
    
        test("should return 404 with no amount", async () => {
            const regimeName = "new";
            const response = await taxySupertest.get(`/getTaxAmount/${regimeName}/?verbose=true`);
            expect(response.status).toBe(404);
        });
    });

    describe("as per new regime", () => {

        const taxySupertest = supertest(server);
        server.use("/", getTaxyRoutes());
        const regimeName = "new";

        test("tax deduction 0 on 150000 at 0% in 0-250000 slab", async () => {
            const amount = 150000;
            const response = await taxySupertest.get(`/getTaxAmount/${regimeName}/${amount}?verbose=true`);
            expect(response.status).toBe(200);
            expect(response.text).toBe(JSON.stringify({
                "incomeBeforeTaxes": 150000,
                "totalPayableTax": 0,
                "incomeAfterTaxes": 150000,
                "slabs": [
                  {
                    "taxSlab": {
                      "gt": 0,
                      "lte": 250000,
                      "rateMultiplier": 0,
                      "taxFromPrevSlab": 0
                    },
                    "taxInThisSlab": 0,
                    "totalTaxesTillNow": 0
                  }
                ]
              }));
        });

        test("tax deduction 7500 on 400000 at 5% in 250000-500000 slab", async () => {
            const amount = 400000;
            const response = await taxySupertest.get(`/getTaxAmount/${regimeName}/${amount}?verbose=true`);
            expect(response.status).toBe(200);
            expect(response.text).toBe(JSON.stringify({
                "incomeBeforeTaxes": 400000,
                "totalPayableTax": 7500,
                "incomeAfterTaxes": 392500,
                "slabs": [
                  {
                    "taxSlab": {
                      "gt": 0,
                      "lte": 250000,
                      "rateMultiplier": 0,
                      "taxFromPrevSlab": 0
                    },
                    "taxInThisSlab": 0,
                    "totalTaxesTillNow": 0
                  },
                  {
                    "taxSlab": {
                      "gt": 250000,
                      "lte": 500000,
                      "rateMultiplier": 0.05,
                      "taxFromPrevSlab": 0
                    },
                    "taxInThisSlab": 7500,
                    "totalTaxesTillNow": 7500
                  }
                ]
              }));
        });

        test("tax deduction 22500 on 600000 at 10% in 500000-750000 slab", async () => {
            const amount = 600000;
            const response = await taxySupertest.get(`/getTaxAmount/${regimeName}/${amount}?verbose=true`);
            expect(response.status).toBe(200);
            expect(response.text).toBe(JSON.stringify({
                "incomeBeforeTaxes": 600000,
                "totalPayableTax": 22500,
                "incomeAfterTaxes": 577500,
                "slabs": [
                  {
                    "taxSlab": {
                      "gt": 0,
                      "lte": 250000,
                      "rateMultiplier": 0,
                      "taxFromPrevSlab": 0
                    },
                    "taxInThisSlab": 0,
                    "totalTaxesTillNow": 0
                  },
                  {
                    "taxSlab": {
                      "gt": 250000,
                      "lte": 500000,
                      "rateMultiplier": 0.05,
                      "taxFromPrevSlab": 0
                    },
                    "taxInThisSlab": 12500,
                    "totalTaxesTillNow": 12500
                  },
                  {
                    "taxSlab": {
                      "gt": 500000,
                      "lte": 750000,
                      "rateMultiplier": 0.1,
                      "taxFromPrevSlab": 12500
                    },
                    "taxInThisSlab": 10000,
                    "totalTaxesTillNow": 22500
                  }
                ]
              }));
        });

        test("tax deduction 52500 on 850000 at 15% in 750000-1000000 slab", async () => {
            const amount = 850000;
            const response = await taxySupertest.get(`/getTaxAmount/${regimeName}/${amount}?verbose=true`);
            expect(response.status).toBe(200);
            expect(response.text).toBe(JSON.stringify({
                "incomeBeforeTaxes": 850000,
                "totalPayableTax": 52500,
                "incomeAfterTaxes": 797500,
                "slabs": [
                  {
                    "taxSlab": {
                      "gt": 0,
                      "lte": 250000,
                      "rateMultiplier": 0,
                      "taxFromPrevSlab": 0
                    },
                    "taxInThisSlab": 0,
                    "totalTaxesTillNow": 0
                  },
                  {
                    "taxSlab": {
                      "gt": 250000,
                      "lte": 500000,
                      "rateMultiplier": 0.05,
                      "taxFromPrevSlab": 0
                    },
                    "taxInThisSlab": 12500,
                    "totalTaxesTillNow": 12500
                  },
                  {
                    "taxSlab": {
                      "gt": 500000,
                      "lte": 750000,
                      "rateMultiplier": 0.1,
                      "taxFromPrevSlab": 12500
                    },
                    "taxInThisSlab": 25000,
                    "totalTaxesTillNow": 37500
                  },
                  {
                    "taxSlab": {
                      "gt": 750000,
                      "lte": 1000000,
                      "rateMultiplier": 0.15,
                      "taxFromPrevSlab": 37500
                    },
                    "taxInThisSlab": 15000,
                    "totalTaxesTillNow": 52500
                  }
                ]
              }));
        });

        test("tax deduction 95000 on 1100000 at 20% in 1000000-1250000 slab", async () => {
            const amount = 1100000;
            const response = await taxySupertest.get(`/getTaxAmount/${regimeName}/${amount}?verbose=true`);
            expect(response.status).toBe(200);
            expect(response.text).toBe(JSON.stringify({
                "incomeBeforeTaxes": 1100000,
                "totalPayableTax": 95000,
                "incomeAfterTaxes": 1005000,
                "slabs": [
                  {
                    "taxSlab": {
                      "gt": 0,
                      "lte": 250000,
                      "rateMultiplier": 0,
                      "taxFromPrevSlab": 0
                    },
                    "taxInThisSlab": 0,
                    "totalTaxesTillNow": 0
                  },
                  {
                    "taxSlab": {
                      "gt": 250000,
                      "lte": 500000,
                      "rateMultiplier": 0.05,
                      "taxFromPrevSlab": 0
                    },
                    "taxInThisSlab": 12500,
                    "totalTaxesTillNow": 12500
                  },
                  {
                    "taxSlab": {
                      "gt": 500000,
                      "lte": 750000,
                      "rateMultiplier": 0.1,
                      "taxFromPrevSlab": 12500
                    },
                    "taxInThisSlab": 25000,
                    "totalTaxesTillNow": 37500
                  },
                  {
                    "taxSlab": {
                      "gt": 750000,
                      "lte": 1000000,
                      "rateMultiplier": 0.15,
                      "taxFromPrevSlab": 37500
                    },
                    "taxInThisSlab": 37500,
                    "totalTaxesTillNow": 75000
                  },
                  {
                    "taxSlab": {
                      "gt": 1000000,
                      "lte": 1250000,
                      "rateMultiplier": 0.2,
                      "taxFromPrevSlab": 75000
                    },
                    "taxInThisSlab": 20000,
                    "totalTaxesTillNow": 95000
                  }
                ]
              }));
        });

        test("tax deduction 150000 on 1350000 at 25% in 1250000-1500000 slab", async () => {
            const amount = 1350000;
            const response = await taxySupertest.get(`/getTaxAmount/${regimeName}/${amount}?verbose=true`);
            expect(response.status).toBe(200);
            expect(response.text).toBe(JSON.stringify({
                "incomeBeforeTaxes": 1350000,
                "totalPayableTax": 150000,
                "incomeAfterTaxes": 1200000,
                "slabs": [
                  {
                    "taxSlab": {
                      "gt": 0,
                      "lte": 250000,
                      "rateMultiplier": 0,
                      "taxFromPrevSlab": 0
                    },
                    "taxInThisSlab": 0,
                    "totalTaxesTillNow": 0
                  },
                  {
                    "taxSlab": {
                      "gt": 250000,
                      "lte": 500000,
                      "rateMultiplier": 0.05,
                      "taxFromPrevSlab": 0
                    },
                    "taxInThisSlab": 12500,
                    "totalTaxesTillNow": 12500
                  },
                  {
                    "taxSlab": {
                      "gt": 500000,
                      "lte": 750000,
                      "rateMultiplier": 0.1,
                      "taxFromPrevSlab": 12500
                    },
                    "taxInThisSlab": 25000,
                    "totalTaxesTillNow": 37500
                  },
                  {
                    "taxSlab": {
                      "gt": 750000,
                      "lte": 1000000,
                      "rateMultiplier": 0.15,
                      "taxFromPrevSlab": 37500
                    },
                    "taxInThisSlab": 37500,
                    "totalTaxesTillNow": 75000
                  },
                  {
                    "taxSlab": {
                      "gt": 1000000,
                      "lte": 1250000,
                      "rateMultiplier": 0.2,
                      "taxFromPrevSlab": 75000
                    },
                    "taxInThisSlab": 50000,
                    "totalTaxesTillNow": 125000
                  },
                  {
                    "taxSlab": {
                      "gt": 1250000,
                      "lte": 1500000,
                      "rateMultiplier": 0.25,
                      "taxFromPrevSlab": 125000
                    },
                    "taxInThisSlab": 25000,
                    "totalTaxesTillNow": 150000
                  }
                ]
              }));
        });

        test("tax deduction 217500 on 1600000 at 30% in above 1500000 slab", async () => {
            const taxySupertest = supertest(server);
            server.use("/", getTaxyRoutes());
            const regimeName = "new";
            const amount = 1600000;
            const response = await taxySupertest.get(`/getTaxAmount/${regimeName}/${amount}?verbose=true`);
            expect(response.status).toBe(200);
            expect(response.text).toBe(JSON.stringify({
                "incomeBeforeTaxes": 1600000,
                "totalPayableTax": 217500,
                "incomeAfterTaxes": 1382500,
                "slabs": [
                  {
                    "taxSlab": {
                      "gt": 0,
                      "lte": 250000,
                      "rateMultiplier": 0,
                      "taxFromPrevSlab": 0
                    },
                    "taxInThisSlab": 0,
                    "totalTaxesTillNow": 0
                  },
                  {
                    "taxSlab": {
                      "gt": 250000,
                      "lte": 500000,
                      "rateMultiplier": 0.05,
                      "taxFromPrevSlab": 0
                    },
                    "taxInThisSlab": 12500,
                    "totalTaxesTillNow": 12500
                  },
                  {
                    "taxSlab": {
                      "gt": 500000,
                      "lte": 750000,
                      "rateMultiplier": 0.1,
                      "taxFromPrevSlab": 12500
                    },
                    "taxInThisSlab": 25000,
                    "totalTaxesTillNow": 37500
                  },
                  {
                    "taxSlab": {
                      "gt": 750000,
                      "lte": 1000000,
                      "rateMultiplier": 0.15,
                      "taxFromPrevSlab": 37500
                    },
                    "taxInThisSlab": 37500,
                    "totalTaxesTillNow": 75000
                  },
                  {
                    "taxSlab": {
                      "gt": 1000000,
                      "lte": 1250000,
                      "rateMultiplier": 0.2,
                      "taxFromPrevSlab": 75000
                    },
                    "taxInThisSlab": 50000,
                    "totalTaxesTillNow": 125000
                  },
                  {
                    "taxSlab": {
                      "gt": 1250000,
                      "lte": 1500000,
                      "rateMultiplier": 0.25,
                      "taxFromPrevSlab": 125000
                    },
                    "taxInThisSlab": 62500,
                    "totalTaxesTillNow": 187500
                  },
                  {
                    "taxSlab": {
                      "gt": 1500000,
                      "lte": null,
                      "rateMultiplier": 0.3,
                      "taxFromPrevSlab": 187500
                    },
                    "taxInThisSlab": 30000,
                    "totalTaxesTillNow": 217500
                  }
                ]
              }));
        });
    });

    describe("as per old regime", () => {

        const taxySupertest = supertest(server);
        server.use("/", getTaxyRoutes());
        const regimeName = "old";

        test("tax deduction 0 on 150000 at 0% in 0-250000 slab", async () => {
            const amount = 150000;
            const response = await taxySupertest.get(`/getTaxAmount/${regimeName}/${amount}?verbose=true`);
            expect(response.status).toBe(200);
            expect(response.text).toBe(JSON.stringify({
                "incomeBeforeTaxes": 150000,
                "totalPayableTax": 0,
                "incomeAfterTaxes": 150000,
                "slabs": [
                  {
                    "taxSlab": {
                      "gt": 0,
                      "lte": 250000,
                      "rateMultiplier": 0,
                      "taxFromPrevSlab": 0
                    },
                    "taxInThisSlab": 0,
                    "totalTaxesTillNow": 0
                  }
                ]
              }));
        });

        test("tax deduction 7500 on 400000 at 5% in 250000-500000 slab", async () => {
            const amount = 400000;
            const response = await taxySupertest.get(`/getTaxAmount/${regimeName}/${amount}?verbose=true`);
            expect(response.status).toBe(200);
            expect(response.text).toBe(JSON.stringify({
                "incomeBeforeTaxes": 400000,
                "totalPayableTax": 7500,
                "incomeAfterTaxes": 392500,
                "slabs": [
                  {
                    "taxSlab": {
                      "gt": 0,
                      "lte": 250000,
                      "rateMultiplier": 0,
                      "taxFromPrevSlab": 0
                    },
                    "taxInThisSlab": 0,
                    "totalTaxesTillNow": 0
                  },
                  {
                    "taxSlab": {
                      "gt": 250000,
                      "lte": 500000,
                      "rateMultiplier": 0.05,
                      "taxFromPrevSlab": 0
                    },
                    "taxInThisSlab": 7500,
                    "totalTaxesTillNow": 7500
                  }
                ]
              }));
        });

        test("tax deduction 32500 on 600000 at 20% in 500000-750000 slab", async () => {
            const amount = 600000;
            const response = await taxySupertest.get(`/getTaxAmount/${regimeName}/${amount}?verbose=true`);
            expect(response.status).toBe(200);
            expect(response.text).toBe(JSON.stringify({
                "incomeBeforeTaxes": 600000,
                "totalPayableTax": 32500,
                "incomeAfterTaxes": 567500,
                "slabs": [
                  {
                    "taxSlab": {
                      "gt": 0,
                      "lte": 250000,
                      "rateMultiplier": 0,
                      "taxFromPrevSlab": 0
                    },
                    "taxInThisSlab": 0,
                    "totalTaxesTillNow": 0
                  },
                  {
                    "taxSlab": {
                      "gt": 250000,
                      "lte": 500000,
                      "rateMultiplier": 0.05,
                      "taxFromPrevSlab": 0
                    },
                    "taxInThisSlab": 12500,
                    "totalTaxesTillNow": 12500
                  },
                  {
                    "taxSlab": {
                      "gt": 500000,
                      "lte": 750000,
                      "rateMultiplier": 0.2,
                      "taxFromPrevSlab": 12500
                    },
                    "taxInThisSlab": 20000,
                    "totalTaxesTillNow": 32500
                  }
                ]
              }));
        });

        test("tax deduction 82500 on 850000 at 20% in 750000-1000000 slab", async () => {
            const amount = 850000;
            const response = await taxySupertest.get(`/getTaxAmount/${regimeName}/${amount}?verbose=true`);
            expect(response.status).toBe(200);
            expect(response.text).toBe(JSON.stringify({
                "incomeBeforeTaxes": 850000,
                "totalPayableTax": 82500,
                "incomeAfterTaxes": 767500,
                "slabs": [
                  {
                    "taxSlab": {
                      "gt": 0,
                      "lte": 250000,
                      "rateMultiplier": 0,
                      "taxFromPrevSlab": 0
                    },
                    "taxInThisSlab": 0,
                    "totalTaxesTillNow": 0
                  },
                  {
                    "taxSlab": {
                      "gt": 250000,
                      "lte": 500000,
                      "rateMultiplier": 0.05,
                      "taxFromPrevSlab": 0
                    },
                    "taxInThisSlab": 12500,
                    "totalTaxesTillNow": 12500
                  },
                  {
                    "taxSlab": {
                      "gt": 500000,
                      "lte": 750000,
                      "rateMultiplier": 0.2,
                      "taxFromPrevSlab": 12500
                    },
                    "taxInThisSlab": 50000,
                    "totalTaxesTillNow": 62500
                  },
                  {
                    "taxSlab": {
                      "gt": 750000,
                      "lte": 1000000,
                      "rateMultiplier": 0.2,
                      "taxFromPrevSlab": 62500
                    },
                    "taxInThisSlab": 20000,
                    "totalTaxesTillNow": 82500
                  }
                ]
              }));
        });

        test("tax deduction 142500 on 1100000 at 30% in 1000000-1250000 slab", async () => {
            const amount = 1100000;
            const response = await taxySupertest.get(`/getTaxAmount/${regimeName}/${amount}?verbose=true`);
            expect(response.status).toBe(200);
            expect(response.text).toBe(JSON.stringify({
                "incomeBeforeTaxes": 1100000,
                "totalPayableTax": 142500,
                "incomeAfterTaxes": 957500,
                "slabs": [
                  {
                    "taxSlab": {
                      "gt": 0,
                      "lte": 250000,
                      "rateMultiplier": 0,
                      "taxFromPrevSlab": 0
                    },
                    "taxInThisSlab": 0,
                    "totalTaxesTillNow": 0
                  },
                  {
                    "taxSlab": {
                      "gt": 250000,
                      "lte": 500000,
                      "rateMultiplier": 0.05,
                      "taxFromPrevSlab": 0
                    },
                    "taxInThisSlab": 12500,
                    "totalTaxesTillNow": 12500
                  },
                  {
                    "taxSlab": {
                      "gt": 500000,
                      "lte": 750000,
                      "rateMultiplier": 0.2,
                      "taxFromPrevSlab": 12500
                    },
                    "taxInThisSlab": 50000,
                    "totalTaxesTillNow": 62500
                  },
                  {
                    "taxSlab": {
                      "gt": 750000,
                      "lte": 1000000,
                      "rateMultiplier": 0.2,
                      "taxFromPrevSlab": 62500
                    },
                    "taxInThisSlab": 50000,
                    "totalTaxesTillNow": 112500
                  },
                  {
                    "taxSlab": {
                      "gt": 1000000,
                      "lte": 1250000,
                      "rateMultiplier": 0.3,
                      "taxFromPrevSlab": 112500
                    },
                    "taxInThisSlab": 30000,
                    "totalTaxesTillNow": 142500
                  }
                ]
              }));
        });

        test("tax deduction 52500 on 1350000 at 30% in 1250000-1500000 slab", async () => {
            const amount = 1350000;
            const response = await taxySupertest.get(`/getTaxAmount/${regimeName}/${amount}?verbose=true`);
            expect(response.status).toBe(200);
            expect(response.text).toBe(JSON.stringify({
                "incomeBeforeTaxes": 1350000,
                "totalPayableTax": 217500,
                "incomeAfterTaxes": 1132500,
                "slabs": [
                  {
                    "taxSlab": {
                      "gt": 0,
                      "lte": 250000,
                      "rateMultiplier": 0,
                      "taxFromPrevSlab": 0
                    },
                    "taxInThisSlab": 0,
                    "totalTaxesTillNow": 0
                  },
                  {
                    "taxSlab": {
                      "gt": 250000,
                      "lte": 500000,
                      "rateMultiplier": 0.05,
                      "taxFromPrevSlab": 0
                    },
                    "taxInThisSlab": 12500,
                    "totalTaxesTillNow": 12500
                  },
                  {
                    "taxSlab": {
                      "gt": 500000,
                      "lte": 750000,
                      "rateMultiplier": 0.2,
                      "taxFromPrevSlab": 12500
                    },
                    "taxInThisSlab": 50000,
                    "totalTaxesTillNow": 62500
                  },
                  {
                    "taxSlab": {
                      "gt": 750000,
                      "lte": 1000000,
                      "rateMultiplier": 0.2,
                      "taxFromPrevSlab": 62500
                    },
                    "taxInThisSlab": 50000,
                    "totalTaxesTillNow": 112500
                  },
                  {
                    "taxSlab": {
                      "gt": 1000000,
                      "lte": 1250000,
                      "rateMultiplier": 0.3,
                      "taxFromPrevSlab": 112500
                    },
                    "taxInThisSlab": 75000,
                    "totalTaxesTillNow": 187500
                  },
                  {
                    "taxSlab": {
                      "gt": 1250000,
                      "lte": 1500000,
                      "rateMultiplier": 0.3,
                      "taxFromPrevSlab": 187500
                    },
                    "taxInThisSlab": 30000,
                    "totalTaxesTillNow": 217500
                  }
                ]
              }));
        });

        test("tax deduction 217500 on 1600000 at 30% in above 1500000 slab", async () => {
            const amount = 1600000;
            const response = await taxySupertest.get(`/getTaxAmount/${regimeName}/${amount}?verbose=true`);
            expect(response.status).toBe(200);
            expect(response.text).toBe(JSON.stringify({
                "incomeBeforeTaxes": 1600000,
                "totalPayableTax": 292500,
                "incomeAfterTaxes": 1307500,
                "slabs": [
                  {
                    "taxSlab": {
                      "gt": 0,
                      "lte": 250000,
                      "rateMultiplier": 0,
                      "taxFromPrevSlab": 0
                    },
                    "taxInThisSlab": 0,
                    "totalTaxesTillNow": 0
                  },
                  {
                    "taxSlab": {
                      "gt": 250000,
                      "lte": 500000,
                      "rateMultiplier": 0.05,
                      "taxFromPrevSlab": 0
                    },
                    "taxInThisSlab": 12500,
                    "totalTaxesTillNow": 12500
                  },
                  {
                    "taxSlab": {
                      "gt": 500000,
                      "lte": 750000,
                      "rateMultiplier": 0.2,
                      "taxFromPrevSlab": 12500
                    },
                    "taxInThisSlab": 50000,
                    "totalTaxesTillNow": 62500
                  },
                  {
                    "taxSlab": {
                      "gt": 750000,
                      "lte": 1000000,
                      "rateMultiplier": 0.2,
                      "taxFromPrevSlab": 62500
                    },
                    "taxInThisSlab": 50000,
                    "totalTaxesTillNow": 112500
                  },
                  {
                    "taxSlab": {
                      "gt": 1000000,
                      "lte": 1250000,
                      "rateMultiplier": 0.3,
                      "taxFromPrevSlab": 112500
                    },
                    "taxInThisSlab": 75000,
                    "totalTaxesTillNow": 187500
                  },
                  {
                    "taxSlab": {
                      "gt": 1250000,
                      "lte": 1500000,
                      "rateMultiplier": 0.3,
                      "taxFromPrevSlab": 187500
                    },
                    "taxInThisSlab": 75000,
                    "totalTaxesTillNow": 262500
                  },
                  {
                    "taxSlab": {
                      "gt": 1500000,
                      "lte": null,
                      "rateMultiplier": 0.3,
                      "taxFromPrevSlab": 262500
                    },
                    "taxInThisSlab": 30000,
                    "totalTaxesTillNow": 292500
                  }
                ]
              }));
        });
    });
});
