# Business Management System - User Guide

## 📋 Table of Contents
1. [Daily Operations Flow](#daily-operations-flow)
2. [User Roles & Responsibilities](#user-roles--responsibilities)
3. [How Each User Benefits](#how-each-user-benefits)
4. [Step-by-Step Workflows](#step-by-step-workflows)

---

## 🌅 Daily Operations Flow

### **Morning - Opening the Business Day**

#### 1. **Manager Opens Business Day**
**Time**: 7:30 AM - Before store opens

```
Manager Login → Dashboard → Open Business Day
- Branch: Downtown Store
- Opening Float: 500,000 RWF
- Status: ✅ Day Opened
```

**What Happens:**
- System creates a new business day record
- Opening float is recorded in cashbook
- All staff can now start their shifts
- Dashboard becomes active for the day

**API Call:**
```bash
POST /api/v1/cashbook/business-day/open
{
  "branch_id": 1,
  "opening_float": 500000
}
```

---

#### 2. **Cashier Opens Cash Session**
**Time**: 8:00 AM - Store opening time

```
Cashier Login → My Cash Session → Open Session
- Opening Float Received: 200,000 RWF
- Register: POS-01
- Status: ✅ Session Active
```

**What Happens:**
- Cashier receives float from manager
- Personal cash session starts
- All sales are tracked to this cashier
- Cash variance tracking begins

**Benefits for Cashier:**
- ✅ Clear accountability for their cash
- ✅ Can see their sales performance in real-time
- ✅ Protected from being blamed for other cashiers' errors
- ✅ Can track their commission (if applicable)

---

### **During Business Hours - Daily Operations**

#### 3. **Customer Walks In - Sale Process**

**Scenario**: Customer buys laptop and accessories

**Cashier's Actions:**
```
1. Scan/Search Products
   - Laptop Dell XPS: 1,500,000 RWF
   - Wireless Mouse: 35,000 RWF
   - USB Cable: 15,000 RWF
   
2. System Calculates:
   - Subtotal: 1,550,000 RWF
   - VAT (18%): 236,610 RWF
   - Total: 1,786,610 RWF
   
3. Customer Pays:
   - Method: MOMO
   - Amount: 1,786,610 RWF
   
4. System Automatically:
   ✅ Records sale
   ✅ Updates inventory (reduces stock)
   ✅ Records VAT (output)
   ✅ Adds to cashbook
   ✅ Updates cashier's session
   ✅ Prints receipt/invoice
```

**Benefits:**
- **Cashier**: Quick, error-free transactions
- **Customer**: Fast checkout, clear receipt
- **Manager**: Real-time sales visibility
- **Accountant**: Automatic VAT tracking
- **Storekeeper**: Instant inventory updates

---

#### 4. **Credit Sale - Corporate Customer**

**Scenario**: ABC Corporation orders equipment on credit

```
Cashier/Receptionist:
1. Select Customer: "ABC Corporation"
2. Add items to sale
3. Payment Method: CREDIT
4. System checks credit limit ✅
5. Complete sale

System Creates:
✅ Sale record
✅ Invoice (can be emailed)
✅ Receivable entry (30 days)
✅ Updates customer balance
✅ Inventory reduced
✅ VAT recorded
```

**Benefits:**
- **Sales Staff**: Can close deals without waiting for payment
- **Customer**: Get goods now, pay later
- **Accountant**: Tracks all credit automatically
- **Owner**: See who owes money at any time

---

#### 5. **Inventory Low Stock Alert**

**Storekeeper Dashboard Shows:**
```
⚠️ Low Stock Alerts:
- USB Cables: 25 units (Reorder point: 75)
- Wireless Mouse: 40 units (Reorder point: 30)

System Suggests:
📦 Order USB Cables: 100 units
📦 Order Wireless Mouse: 50 units
```

**Storekeeper's Actions:**
```
1. Create Purchase Order
   - Supplier: Tech Distributors Ltd
   - Items with suggested quantities
   - Status: Draft
   
2. Send to Manager for Approval

Manager Approves → PO Status: APPROVED

3. Order sent to supplier
```

**Benefits:**
- **Storekeeper**: Never run out of stock
- **Manager**: Control over what's ordered
- **Business**: Optimal inventory levels
- **Customers**: Products always available

---

#### 6. **Expense Recording**

**Scenario**: Electricity bill needs to be paid

```
Manager/Accountant:
1. Create Expense
   - Category: Utilities
   - Payee: EUCL (Electric company)
   - Amount: 150,000 RWF
   - VAT: 27,000 RWF
   - Payment: Bank Transfer
   - Attach: Receipt/Bill photo
   
2. Manager Approves

3. Accountant Marks as Paid

System Records:
✅ Expense in books
✅ Cash out in cashbook
✅ VAT input recorded
✅ Category tracking
```

**Benefits:**
- **Manager**: Controls all spending
- **Accountant**: Complete expense tracking
- **Owner**: Sees where money goes
- **Tax Authority**: VAT properly tracked

---

#### 7. **Purchase Received - Goods Arrive**

**Scenario**: Ordered laptops arrive from supplier

```
Storekeeper:
1. Receives goods + Invoice from supplier
2. Create Purchase Invoice in system
   - Match to PO
   - Verify quantities
   - Enter invoice details
   - Invoice: 60,000,000 RWF
   - VAT: 9,152,542 RWF
   - WHT (3%): 1,525,424 RWF (to be paid to tax authority)
   - Net to Supplier: 58,474,576 RWF

System Automatically:
✅ Increases inventory
✅ Records VAT input
✅ Creates accounts payable
✅ Links to PO
✅ Tracks what we owe supplier
```

**Benefits:**
- **Storekeeper**: Accurate stock records
- **Accountant**: Knows exactly what to pay
- **Owner**: See cash flow obligations
- **Supplier**: Clear record of what's owed

---

### **Evening - Closing Operations**

#### 8. **Cashier Closes Session**
**Time**: 6:00 PM - End of shift

```
Cashier:
1. Count cash in register
   - Expected: 3,200,000 RWF
   - Actual: 3,195,000 RWF
   - Variance: -5,000 RWF (short)
   
2. Close session
3. Submit cash to manager

System Shows:
📊 Today's Performance:
- Sales: 45 transactions
- Total: 12,500,000 RWF
- Commission Earned: 125,000 RWF
- Variance: -5,000 RWF ⚠️
```

**Benefits for Cashier:**
- ✅ Clear end-of-day report
- ✅ Know their performance
- ✅ See commission earned
- ✅ Variance investigation protects them

---

#### 9. **Manager Closes Business Day**
**Time**: 7:00 PM - After all cashiers done

```
Manager:
1. Review all cash sessions
   - Cashier 1: +2,000 RWF variance ✅
   - Cashier 2: -5,000 RWF variance ⚠️
   - Cashier 3: 0 variance ✅
   
2. Count total cash
   - Expected: 8,500,000 RWF
   - Actual: 8,497,000 RWF
   - Variance: -3,000 RWF
   
3. Close Business Day

System Generates:
📊 Daily Report:
- Total Sales: 25,000,000 RWF
- Cash: 8,497,000 RWF
- MOMO: 10,000,000 RWF
- Cards: 4,000,000 RWF
- Credit: 2,500,000 RWF
- Expenses: 450,000 RWF
- Variance: -3,000 RWF
```

**Benefits for Manager:**
- ✅ Complete visibility of the day
- ✅ Identify cash handling issues
- ✅ Know exact financial position
- ✅ Ready for next day

---

## 👥 User Roles & Responsibilities

### **1. Owner** (John Doe)
**Dashboard View**: Everything across all branches

**Daily Tasks:**
- Review consolidated reports
- Approve large purchases
- Monitor branch performance
- Check cash flow
- Review profitability

**System Benefits:**
- 📊 **Real-time visibility**: See all branches live
- 💰 **Financial control**: Know exact position anytime
- 📈 **Trend analysis**: Compare branches, periods
- ⚠️ **Alerts**: Low stock, overdue payments, cash variances
- 📱 **Mobile access**: Check from anywhere

**Example Workflow:**
```
Morning: Check dashboard on phone
- Branch 1: 5M sales yesterday ✅
- Branch 2: 3M sales, 50K variance ⚠️
- Total cash position: 25M
- Overdue invoices: 2M ⚠️

Action: Call Branch 2 manager about variance
Action: Review credit customers list
```

---

### **2. Manager** (Jane Smith)
**Dashboard View**: Their branch only

**Daily Tasks:**
- Open/close business day
- Approve expenses
- Approve purchase orders
- Resolve cash variances
- Handle customer issues
- Review daily performance

**System Benefits:**
- 🎯 **Branch control**: Full authority over operations
- 👥 **Staff monitoring**: See each cashier's performance
- 💵 **Cash accountability**: Track every penny
- 📦 **Inventory oversight**: Approve stock orders
- 📊 **Performance reports**: Daily, weekly, monthly

**Example Workflow:**
```
7:30 AM: Open business day
8:00 AM: Review overnight expenses (3 pending)
10:00 AM: Approve purchase order (USB cables)
2:00 PM: Check real-time sales (halfway to target)
6:30 PM: Review cash sessions before closing
7:00 PM: Close day, review variances
```

---

### **3. Cashier** (Mike Johnson)
**Dashboard View**: Their POS & sales only

**Daily Tasks:**
- Open cash session
- Process sales
- Handle payments
- Issue receipts
- Close session
- Count cash

**System Benefits:**
- 💰 **Protected cash tracking**: Only responsible for their register
- 📈 **Sales targets**: See progress toward goals
- 💵 **Commission tracking**: Know earnings in real-time
- ⚡ **Fast checkout**: Barcode scanning, quick search
- 📄 **Auto receipts**: Print/email instantly

**Example Workflow:**
```
8:00 AM: Receive 200K float, open session
8:30 AM - 6:00 PM: Process sales
- Scan products
- Select payment method
- System does the rest

6:00 PM: Close session
- Count cash
- Submit report
- See: Sold 4.5M today, earned 45K commission
```

---

### **4. Storekeeper** (Sarah Williams)
**Dashboard View**: Inventory across warehouses

**Daily Tasks:**
- Check stock levels
- Create purchase orders
- Receive goods
- Stock adjustments
- Stock transfers
- Investigate discrepancies

**System Benefits:**
- 📦 **Real-time stock**: Always know what's available
- ⚠️ **Smart alerts**: Get notified before stockouts
- 🤖 **Auto suggestions**: System recommends order quantities
- 📊 **Movement tracking**: See every stock change
- 🔄 **Easy transfers**: Move stock between branches

**Example Workflow:**
```
Morning Dashboard:
⚠️ 5 items below reorder point
📋 2 purchase orders pending approval
📦 1 delivery expected today

Actions:
1. Create PO for low stock items
2. Receive delivery from supplier
3. System auto-updates inventory
4. Transfer 20 mice to Branch 2

Result: All locations properly stocked
```

---

### **5. Accountant** (David Brown)
**Dashboard View**: Financial records & reports

**Daily Tasks:**
- Review expenses
- Process payments
- Reconcile accounts
- Generate VAT reports
- Track receivables
- Monitor payables

**System Benefits:**
- 📊 **Auto VAT tracking**: Input & output automatically recorded
- 💳 **Expense control**: Approve/reject expenses
- 📉 **Cash flow visibility**: Know exactly what's owed/owing
- 📈 **P&L reports**: Instant profit/loss statements
- 🧾 **Tax compliance**: VAT reports ready anytime

**Example Workflow:**
```
Daily:
- Review 5 expenses for approval
- Check overdue invoices (3 customers)
- Send payment reminders
- Process supplier payment (2M)

Monthly:
- Generate VAT report
- Calculate PAYE for staff
- Prepare P&L statement
- Submit to owner
```

---

### **6. Receptionist** (Emma Davis)
**Dashboard View**: Front desk & bookings

**Daily Tasks:**
- Process walk-in sales
- Handle service bookings
- Issue invoices
- Collect payments
- Customer service

**System Benefits:**
- 🎫 **Quick checkout**: Fast, error-free transactions
- 📅 **Booking management**: Track services/rooms
- 💳 **Multi-payment**: Cash, card, MOMO all tracked
- 📄 **Invoice generation**: Instant professional invoices
- 📊 **Daily summary**: See day's performance

**Perfect For:**
- Hotels (room bookings)
- Restaurants (table reservations)
- Service businesses (appointments)

---

### **7. Driver** (James Wilson)
**Dashboard View**: Delivery assignments

**Daily Tasks:**
- View delivery schedule
- Update delivery status
- Collect payments (COD)
- Confirm deliveries
- Report issues

**System Benefits:**
- 📍 **Delivery tracking**: Real-time status updates
- 💰 **COD collection**: Record cash on delivery
- ✅ **Proof of delivery**: Photo upload
- 🗺️ **Route optimization**: Organized by zone
- 📊 **Performance tracking**: Deliveries completed

---

### **8. Salesperson** (Lisa Anderson)
**Dashboard View**: Sales & customers

**Daily Tasks:**
- Create sales
- Manage customers
- Follow up leads
- Track commissions
- Generate quotes

**System Benefits:**
- 💰 **Commission tracking**: Know exactly what you've earned
- 👥 **Customer history**: See past purchases
- 📊 **Sales targets**: Track progress
- 📄 **Quick quotes**: Generate professional quotations
- 📈 **Performance reports**: Daily, weekly, monthly stats

---

## 🎯 How Each User Benefits

### **Summary Table**

| User | Key Benefit | Daily Time Saved | Stress Reduced |
|------|-------------|------------------|----------------|
| **Owner** | Complete business visibility from anywhere | 2-3 hours | 80% |
| **Manager** | Automated daily reports, variance tracking | 1-2 hours | 70% |
| **Cashier** | Protected accountability, auto calculations | 30-60 min | 60% |
| **Storekeeper** | Never run out of stock, smart ordering | 1-2 hours | 75% |
| **Accountant** | Auto VAT, instant reports | 2-4 hours | 85% |
| **Receptionist** | Fast checkout, professional invoices | 1 hour | 50% |
| **Driver** | Clear delivery lists, easy updates | 30 min | 40% |
| **Salesperson** | Commission visibility, customer tracking | 1 hour | 60% |

---

## 🔄 Complete Day Flow Example

### **Downtown Store - Typical Monday**

**7:30 AM** - Manager Jane opens business day
- Opening float: 500,000 RWF recorded

**8:00 AM** - 3 cashiers open sessions
- Each receives 200,000 RWF float
- System tracking begins

**8:30 AM** - Store opens
- Sales start automatically recording
- Inventory updates in real-time

**10:00 AM** - Storekeeper Sarah notices alert
- USB cables low stock
- Creates PO, manager approves instantly

**12:00 PM** - Lunch rush
- 25 transactions in 1 hour
- All tracked perfectly
- Inventory automatically updated

**2:00 PM** - Supplier delivery arrives
- Sarah receives goods
- Creates purchase invoice
- Inventory increased automatically

**3:00 PM** - Accountant David reviews
- 5 expenses approved
- Payment made to supplier
- VAT entries recorded automatically

**4:00 PM** - Corporate customer ABC calls
- Receptionist Emma creates credit sale
- Invoice emailed automatically
- Receivable tracked in system

**6:00 PM** - Cashiers close sessions
- All cash counted
- Variances noted
- Daily performance visible

**7:00 PM** - Manager closes business day
- Reviews all variances
- Checks final totals
- System generates complete report

**7:30 PM** - Owner John checks phone
- Sees: 25M sales today ✅
- 3K variance (acceptable) ✅
- 2 new credit customers ✅
- Stock levels healthy ✅

**Everyone goes home knowing:**
- Exactly what they accomplished
- Their performance metrics
- Tomorrow's priorities
- Complete peace of mind

---

## 🌟 System Value Proposition

### **Instead of:**
- ❌ Manual calculations (errors)
- ❌ Paper receipts (lost)
- ❌ Excel sheets (outdated)
- ❌ Guessing stock levels
- ❌ Month-end panic for VAT
- ❌ Blaming staff for missing cash
- ❌ Delayed reports
- ❌ Not knowing profitability

### **You get:**
- ✅ Automatic calculations (accurate)
- ✅ Digital records (searchable)
- ✅ Real-time data (current)
- ✅ Exact stock levels
- ✅ VAT ready anytime
- ✅ Clear accountability
- ✅ Instant reports
- ✅ Live profitability

---

## 📞 Support & Training

**For new users:**
1. Watch role-specific training video (15 minutes)
2. Practice in demo mode (30 minutes)
3. Shadow experienced user (1 day)
4. Go live with support (ongoing)

**Need help?**
- 📧 Email: support@yourbusiness.com
- 📱 WhatsApp: +250 788 XXX XXX
- 💬 In-app chat support
- 📖 Video tutorials
---
**🎉 Welcome to stress-free business management!**