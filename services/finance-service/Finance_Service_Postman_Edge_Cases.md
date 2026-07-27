# Finance Service API Reference & Mathematical Formulas

The Finance Service runs on port `4003` (`http://localhost:4003`).

---

## 📐 Complete Mathematical Formulas Reference

### 1. Equated Monthly Installment (EMI) Formula
$$\text{EMI} = \frac{P \cdot R \cdot (1+R)^N}{(1+R)^N - 1}$$

- $P$ = Principal Loan Amount (e.g. ₹50,00,000)
- $R$ = Monthly Interest Rate = $\frac{\text{Annual Interest Rate}}{12 \times 100}$
- $N$ = Total Tenure in Months = $\text{Tenure in Years} \times 12$
- $\text{Total Payment} = \text{EMI} \times N$
- $\text{Total Interest Paid} = \text{Total Payment} - P$

---

### 2. Stamp Duty & Registration Fee Formula
$$\text{Stamp Duty Amount} = \text{Property Price} \times \left(\frac{\text{Stamp Duty \%}}{100}\right)$$
$$\text{Registration Amount} = \text{Property Price} \times \left(\frac{\text{Registration \%}}{100}\right)$$
$$\text{Total Government Charges} = \text{Stamp Duty Amount} + \text{Registration Amount}$$

*(Rates are read state-wise from `finance_rates` table).*

---

### 3. Goods and Services Tax (GST) Formula
$$\text{GST Amount} = 
\begin{cases} 
\text{Property Price} \times \left(\frac{\text{GST \%}}{100}\right) & \text{if } \text{Construction Status} = \text{UNDER\_CONSTRUCTION} \\
0 & \text{if } \text{Construction Status} = \text{READY\_TO_MOVE}
\end{cases}$$

$$\text{Total Price with GST} = \text{Property Price} + \text{GST Amount}$$

---

### 4. Maintenance Cost Estimator Range Formula
$$\text{Monthly Maintenance}_{\text{Min}} = \text{Area (sq. ft.)} \times \text{Min Rate per sq. ft.}$$
$$\text{Monthly Maintenance}_{\text{Max}} = \text{Area (sq. ft.)} \times \text{Max Rate per sq. ft.}$$
$$\text{Yearly Maintenance} = \text{Monthly Maintenance} \times 12$$

#### Rate Lookup Matrix:
- **Tier 1 Cities (Apartment)**: ₹3 – ₹6 / sq. ft / month
- **Tier 1 Cities (Villa)**: ₹4 – ₹7 / sq. ft / month
- **Tier 2 Cities (Apartment)**: ₹2 – ₹4 / sq. ft / month
- **Tier 2 Cities (Villa)**: ₹3 – ₹5 / sq. ft / month
- **Tier 3 Cities**: ₹1 – ₹2.5 / sq. ft / month
- **Plot**: ₹0 (No regular maintenance charges)

---

### 5. Rent Affordability Formula (30% Golden Rule)
$$\text{Net Available Monthly Income} = \max(0, \text{Monthly Gross Income} - \text{Existing EMIs})$$
$$\text{Safe Recommended Max Rent (30\% Rule)} = \text{Net Income} \times 0.30$$
$$\text{Aggressive Rent Limit (40\% Rule)} = \text{Net Income} \times 0.40$$

---

## 🔌 API Endpoints & Request/Response Scenarios

### 1. EMI Calculator (FR-FIN-01)
`POST /finance/emi`
```json
{
  "loanAmount": 5000000,
  "annualInterestRate": 8.5,
  "tenureYears": 20
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "loanAmount": 5000000,
    "annualInterestRate": 8.5,
    "tenureYears": 20,
    "tenureMonths": 240,
    "monthlyEmi": 43391,
    "totalInterest": 5413840,
    "totalPayment": 10413840,
    "summaryText": "Your estimated EMI is ₹43,391/month for 20 years."
  }
}
```

---

### 2. Stamp Duty & Registration Charges (FR-FIN-02)
`POST /finance/stamp-duty`
```json
{
  "propertyPrice": 10000000,
  "state": "MAHARASHTRA"
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "state": "MAHARASHTRA",
  "data": {
    "propertyPrice": 10000000,
    "stampDutyPercent": 6,
    "stampDutyAmount": 600000,
    "regPercent": 1,
    "regAmount": 100000,
    "totalGovernmentCharges": 700000,
    "summaryText": "Government charges total ₹7,00,000 (Stamp Duty 6% + Registration 1%)."
  }
}
```

---

### 3. GST Calculation (FR-FIN-03)
`POST /finance/gst`
```json
{
  "propertyPrice": 5000000,
  "constructionStatus": "UNDER_CONSTRUCTION",
  "state": "MAHARASHTRA"
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "propertyPrice": 5000000,
    "constructionStatus": "UNDER_CONSTRUCTION",
    "isGstApplicable": true,
    "gstPercent": 5,
    "gstAmount": 250000,
    "totalPriceWithGst": 5250000,
    "summaryText": "GST of 5% applies to Under Construction properties, adding ₹2,50,000."
  }
}
```

---

### 4. Maintenance Cost Estimator (FR-FIN-04)
`POST /finance/maintenance`
```json
{
  "areaSqFt": 1200,
  "cityTier": "TIER_1",
  "propertyType": "APARTMENT"
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "areaSqFt": 1200,
    "cityTier": "TIER_1",
    "propertyType": "APARTMENT",
    "ratePerSqFtRange": "₹3 - ₹6",
    "monthlyMin": 3600,
    "monthlyMax": 7200,
    "yearlyMin": 43200,
    "yearlyMax": 86400,
    "summaryText": "Estimated monthly maintenance is ₹3,600 - ₹7,200/month."
  }
}
```

---

### 5. Rent Affordability Calculator (FR-FIN-05)
`POST /finance/rent-affordability`
```json
{
  "monthlyIncome": 100000,
  "existingEmi": 10000
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "monthlyIncome": 100000,
    "existingEmi": 10000,
    "netAvailableIncome": 90000,
    "maxRecommendedRent": 27000,
    "maxAggressiveRent": 36000,
    "summaryText": "Based on your monthly income of ₹1,00,000, your recommended safe monthly rent budget is up to ₹27,000."
  }
}
```

---

### 6. Admin Rate Update (FR-FIN-06)
`PUT /finance/rates`
- **Headers:** `Authorization: Bearer <ADMIN_ACCESS_TOKEN>`
```json
{
  "state": "MAHARASHTRA",
  "stampDutyPercent": 7.0,
  "regPercent": 1.0,
  "gstPercent": 5.0
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "message": "Finance rates updated for state MAHARASHTRA",
  "data": {
    "id": "...",
    "state": "MAHARASHTRA",
    "stampDutyPercent": 7,
    "regPercent": 1,
    "gstPercent": 5
  }
}
```
