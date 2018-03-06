**Sau-Tian POS data conversion backend service**

---

**Propose**: Enable users to create a modified copy of the actual sales data, in order to supply a set of sales records in accordance to 3M requirements

1.  webserver to provide a web client interface

2.  extract live POS data from the existing POS system (Foxpro database system) and generate working data

3.  persist a copy of the modified data in a local database (Sqlite) tables for review and future updates

4.  export modified data files in .cvs format (format defined according to 3M documentation):

    * clients - only list those with in the predefined geographical areas
    * products - only list 3M products
    * sales information - user modified live data

5.  provide services to:
    * save conversion factor data to a .json file
    * save modified sales data to a .json file
    * reload conversion factor data from a .json file
    * reload modified sales data from a .json file
    * clear and reset conversion factor data
    * clear and reset modified sales data

---

**Definitions of working database tables**

* products - extracted from live POS data table (item.DBF)

  * id (ITEMNO) - string
  * sapId (SITEMNO) - string (it's not consistently used, so data is only extracted as a reference. Some contains what looks to be out-of-date 3M product ID's)
  * name (ITEMNAME) - string
  * stockQty (STOCKQTY) - integer
  * unit (STKUNIT) - string
  * length - always null, it's specified by 3M but not required
  * width - always null, it's specified by 3M but not required
  * asp - always null, it's specified by 3M but not required (avg sales price?)

* conversionFactors - defined by 3M, which is a set of values that are in a 1:1 relationship with the actual product records in the POS system

  * id - string
  * productId - foreign key to products.id
  * conversionFactor - float

  \*\* It's supplied originally in an excel file. Should be edited to contain only the required fields with appropriate field names and convert to .json file to use

* clients - extracted from live POS data table (customer.DBF)

  * id (CUSTNO) - string
  * name (CUSTABBR) - string
  * registrationId (UNIFORM) - string
  * contact (CON1) - string
  * zipCode (COMPZIP) - string
  * areaId (AREANO) - integer
  * address (COMPADDR) - string
  * telephone (TEL1) - string
  * fax (FAX) - string
  * type - string; always null as project contractor cannot precisely describe this field

* invoices - extracted from live POS data table (sal.DBF)

  * id (SNO) - string
  * date (DATE2) - date (live data is in a string form of 'yyyymmdd')
  * clientId (CUSTNO) - string
  * employeeId (EMPNO) - string

* sales - extracted from live POS data table (saldet.DBF)

  * id (BNO) - string
  * invoiceId (SNO) - string
  * productId (ITEMNO) - string
  * quantity (QTY) - float
  * unitPrice (PRICE) - float

* customSalesData - records of the sales data that had been modified by the user

  * id - uuidV4
  * invoiceId (SNO) - string
  * clientId (CUSTNO) - string
  * salesId (BNO) - string
  * productId (ITEMNO) - string
  * conversionFactorId - string
  * unitPrice (PRICE) - float
  * \_preserved - boolean
  * \_clientId (CUSTNO) - string
  * \_unitPrice (PRICE) - float
  * \_quantity (QTY) - float
  * \_employeeId (EMPNO) - string

---

**Issues with the live POS data and user supplied data**

1.  there aren't many choices in the node.js libraries available to access the Foxpro POS data that contains Chinese characters

2.  an invoice may have multiple entries of sales details on the same product (differs in sold price)

3.  some products listed in the saldet.DBF does not actually exist in the item.DBF

4.  as conversion factors may change, an out of date conversion factor data file (excel) may contain entries that do not hold valid/existing product in the item.DBF file

5.  commas or apostrophe characters are not allowed in the text data to be submitted to 3M, but multiple entries in the live POS data already contains these characters

6.  some required fields are empty in the live POS data (for example, the zipCode field)

---

**Other constants**
dis_no: 400005 (this is the distributor id of the project contractor)

**SQL query for data corruption (duplicated) checking**
select _ from customSalesData where invoiceId in (select invoiceId from (
select invoiceId, count(_) as count from customSalesData group by invoiceId, salesId, productId )
where count > 1) order by invoiceId, salesId, productId;
