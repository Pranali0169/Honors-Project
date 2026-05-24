# from fastapi import FastAPI, Depends, UploadFile, File, Form, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from sqlalchemy.orm import Session
# from pydantic import BaseModel
# import shutil
# import os
# from models import Bill  # or wherever your Bill model is defined
# from database import get_db  # ✅ Use absolute import if both files are in the same folder

# import database, models, crud

# # Create FastAPI app
# app = FastAPI()

# # ✅ Allow frontend (localhost:8080) to access backend (localhost:8000)
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://127.0.0.1:8080", "http://localhost:8080"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Upload directory setup
# UPLOAD_DIR = "uploads"
# os.makedirs(UPLOAD_DIR, exist_ok=True)

# # Create DB tables
# models.Base.metadata.create_all(bind=database.engine)

# # 🧾 Request model for customer
# class CustomerCreate(BaseModel):
#     customerName: str
#     customerPhone: str
#     customerEmail: str

# @app.post("/add_customer/")
# async def add_customer(customer: CustomerCreate, db: Session = Depends(database.get_db)):
#     print("Received customer:", customer)
#     created = crud.add_customer(db, customer.customerName, customer.customerPhone, customer.customerEmail)
#     if not created:
#         raise HTTPException(status_code=400, detail="Customer not created")
#     return created

#     db_customer = models.Customer(
#         name=customer.customerName,
#         phone=customer.customerPhone,
#         email=customer.customerEmail
#     )
#     db.add(db_customer)
#     db.commit()
#     db.refresh(db_customer)
#     return {"id": db_customer.id, "name": db_customer.name}


# # 📋 Get All Customers
# @app.get("/customers/")
# def get_customers(db: Session = Depends(database.get_db)):
#     return crud.get_customers(db)

# # ➕ Add Flower
# @app.post("/add_flower/")
# async def add_flower(
#     name: str = Form(...),
#     price: int = Form(...),
#     count: int = Form(...),
#     image: UploadFile = File(...),
#     db: Session = Depends(database.get_db)
# ):
#     image_path = os.path.join(UPLOAD_DIR, image.filename)
#     with open(image_path, "wb") as buffer:
#         shutil.copyfileobj(image.file, buffer)
#     return crud.add_flower(db, name, price, count, image_path)

# # 📋 Get All Flowers
# @app.get("/flowers/")
# def get_flowers(db: Session = Depends(database.get_db)):
#     return crud.get_flowers(db)

# # ➕ Add Bill Entry
# @app.post("/add_bill/")
# def add_bill(customer_id: int, flower_id: int, quantity: int, total_price: float, db: Session = Depends(database.get_db)):
#     return crud.add_bill(db, customer_id, flower_id, quantity, total_price)

# # ❌ Delete Flower
# @app.delete("/delete_flower/{flower_id}")
# def delete_flower(flower_id: int, db: Session = Depends(database.get_db)):
#     deleted = crud.delete_flower(db, flower_id)
#     if not deleted:
#         raise HTTPException(status_code=404, detail="Flower not found")
#     return {"message": "Flower deleted successfully"}


# @app.get("/get_bills/{customer_id}")
# def get_bills(customer_id: int, db: Session = Depends(get_db)):
#     return db.query(Bill).filter(Bill.customer_id == customer_id).all()

# # ❌ Delete Customer
# @app.delete("/delete_customer/{customer_id}")
# def delete_customer(customer_id: int, db: Session = Depends(get_db)):
#     db_customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
#     if db_customer:
#         db.delete(db_customer)
#         db.commit()
#         return {"message": f"Customer with id {customer_id} deleted successfully"}
#     else:
#         raise HTTPException(status_code=404, detail="Customer not found")







from fastapi import FastAPI, Depends, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
import shutil
import os
from models import Bill
from database import get_db
from datetime import datetime, timedelta
from fastapi.responses import JSONResponse
import database, models, crud

from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi import Request

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

models.Base.metadata.create_all(bind=database.engine)

class CustomerCreate(BaseModel):
    customerName: str
    customerPhone: str
    customerEmail: str

class CustomerEdit(BaseModel):
    id: str
    name: str
    phone: str
    email: str

class FlowerEdit(BaseModel):
    id: int
    newname: str
    newprice: float
    newquantity: int

@app.post("/add_customer/")
async def add_customer(customer: CustomerCreate, db: Session = Depends(database.get_db)):
    print("Received customer:", customer)
    created = crud.add_customer(db, customer.customerName, customer.customerPhone, customer.customerEmail)
    if not created:
        raise HTTPException(status_code=400, detail="Customer not created")
    return created

@app.post("/edit_customer/")
async def edit_customer(data: CustomerEdit, db: Session = Depends(database.get_db)):

    try:
        customer_id = int(data.id)
        if not customer_id:
            raise ValueError("Customer ID is required to update data.")

        customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()

        if customer is None:
            raise ValueError(f"No customer found with ID {customer_id}")

        # Update fields if provided in data
        customer.name = data.name
        customer.email = data.email
        customer.phone = data.phone

        db.commit()
        print(f"Customer with ID {customer_id} updated successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error updating customer: {e}")
    finally:
        db.close()

@app.post("/edit_flower/")
async def edit_flower(data: FlowerEdit, db: Session = Depends(database.get_db)):

    try:
        flower_id = int(data.id)
        if not flower_id:
            raise ValueError("flower ID is required to update data.")

        flower = db.query(models.Flower).filter(models.Flower.id == flower_id).first()

        if flower is None:
            raise ValueError(f"No flower found with ID {flower_id}")

        # Update fields if provided in data
        flower.name = str(data.newname)
        flower.price = float(data.newprice)
        flower.quantity = int(data.newquantity)

        db.commit()
        print(f"flower with ID {flower_id} updated successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error updating flower: {e}")
    finally:
        db.close()



@app.get("/customers/")
def get_customers(db: Session = Depends(database.get_db)):
    return crud.get_customers(db)

@app.post("/add_flower/")
async def add_flower(
    name: str = Form(...),
    price: int = Form(...),
    count: int = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(database.get_db)
):
    image_path = os.path.join(UPLOAD_DIR, image.filename)
    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
    return crud.add_flower(db, name, price, count, image_path)

@app.get("/flowers/")
def get_flowers(db: Session = Depends(database.get_db)):
    return crud.get_flowers(db)

@app.post("/add_bill/")
def add_bill(customer_id: str=Form(...), flower_id: int=Form(...),flower_name: str = Form(...), quantity: int=Form(...),gst: float=Form(...),discount: float=Form(...), total_price: float=Form(...), rate_at_purchase: float=Form(...), purchase_date: str=Form(...), db: Session = Depends(database.get_db)):
    customer_id = int(customer_id)
    try:
        print("aa")
        purchase_datetime = datetime.fromisoformat(purchase_date)
        flower = db.query(models.Flower).filter(models.Flower.id == flower_id).first()
        if not flower:
            raise Exception("Flower not found")

        # if flower.quantity < quantity:
        #     raise Exception("Not enough flowers in stock")

        # # reduce stock
        # flower.quantity -= quantity  

        db_bill = models.Bill(
            customer_id=customer_id,
            flower_id=flower_id,
            flower_name = flower_name,
            quantity=quantity,
            gst = gst,
            discount = discount,
            total_price=total_price,
            rate_at_purchase=rate_at_purchase,
            purchase_date=purchase_datetime
        )
        db.add(db_bill)
        db.commit()

        db.refresh(db_bill)
        return db_bill
    except Exception as e:
        print(f"Error in /add_bill/: {e}")  # Print the exception
        raise HTTPException(status_code=500, detail=f"Error adding bill: {str(e)}")
    
@app.post("/update_passbook/")
async def update_passbook(customer_id: str=Form(...), debit: float=Form(...), credit: float=Form(...), purchase_date: str=Form(...), db: Session = Depends(database.get_db)):
    customer_id = int(customer_id)
    try:
        purchase_datetime = datetime.fromisoformat(purchase_date)

        # Get the latest passbook total_price for the customer
        latest_entry = db.query(models.Passbook).filter_by(customer_id=customer_id).order_by(desc(models.Passbook.id)).first()
        
        if latest_entry:
            previous_total = latest_entry.total_price
        else:
            previous_total = 0.0  # No entry yet for the customer

        final_total = previous_total + credit - debit

        # Create new entry
        new_entry = models.Passbook(
            customer_id=customer_id,
            credit=credit,
            debit=debit,
            total_price=final_total,
            date = purchase_datetime
        )

        db.add(new_entry)
        db.commit()
        return JSONResponse(content={"message": "Passbook updated successfully"})
    except Exception as e:
        print(f"Error in /update_passbook/: {e}")  # Print the exception
        raise HTTPException(status_code=500, detail=f"Error adding in passbook: {str(e)}")
    
@app.get("/get_total/{customer_id}")
def get_total(customer_id: int, db: Session = Depends(get_db)):
    customer_id = int(customer_id)
    try:
        # Get the latest passbook total_price for the customer
        latest_entry = db.query(models.Passbook).filter_by(customer_id=customer_id).order_by(desc(models.Passbook.id))
        
        if latest_entry:
            debited = latest_entry.first().debit
            current_total = latest_entry.first().total_price
            previous_total = latest_entry.offset(1).first()
            if(previous_total):
                previous_total = previous_total.total_price
            else:
                previous_total = 0

        return previous_total,current_total,debited
    except Exception as e:
        print(f"Error in /get_total/: {e}")  # Print the exception
        raise HTTPException(status_code=500, detail=f"Error getting the total price: {str(e)}")

@app.delete("/delete_flower/{flower_id}")
def delete_flower(flower_id: int, db: Session = Depends(database.get_db)):
    deleted = crud.delete_flower(db, flower_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Flower not found")
    return {"message": "Flower deleted successfully"}

@app.get("/get_bills/{customer_id}")
def get_bills(customer_id: int, db: Session = Depends(get_db)):
    try:
        bills = db.query(Bill).filter(Bill.customer_id == customer_id).all()
        return bills
    except Exception as e:
        print(f"Error in /get_bills/: {e}")  # Print the exception
        raise HTTPException(status_code=500, detail=f"Error fetching bills: {str(e)}")

@app.delete("/delete_bill/{bill_id}")
def del_bill(bill_id: int, db: Session = Depends(get_db)):
    db_bill = db.query(models.Bill).filter(models.Bill.id == bill_id).first()
    if db_bill:
        db.delete(db_bill)
        db.commit()
        return {"message": f"Bill with id {bill_id} deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail="Customer not found")
    
@app.delete("/delete_customer/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    db_customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if db_customer:
        db.delete(db_customer)
        db.commit()
        return {"message": f"Customer with id {customer_id} deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail="Customer not found")
    
@app.get("/download_passbook/")
def get_passbook_data(customer_id: int, start_date: str, end_date: str, db: Session = Depends(get_db)):
    # db_session = db()
    print(customer_id,start_date,end_date)
    try:
        # Convert date strings to datetime objects
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        end_dt = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1)  # to include entire end date

        # Query filtered by datetime and customer_id
        results = db.query(models.Passbook).filter(
            models.Passbook.customer_id == customer_id,
            models.Passbook.date >= start_dt,
            models.Passbook.date < end_dt  # less than next day to include end date till 23:59:59
        ).order_by(models.Passbook.date.asc()).all()
    
        # Format results
        output = [[r.date.strftime("%Y-%m-%d %H:%M:%S"), r.debit, r.credit, r.total_price] for r in results]
        print(output)
        return JSONResponse(content=output)

    finally:
        db.close()

# Mount the static files (CSS, JS)
app.mount("/static", StaticFiles(directory="../static"), name="static")
app.mount("/backend/uploads", StaticFiles(directory="./uploads"), name="uploads")
# app.mount("/addCustomer.html", StaticFiles(directory="../templates/addCustomer.html"), name="uploads")
# app.mount("/newData.html", StaticFiles(directory="../templates/newData.html"), name="uploads")
# app.mount("/index.html", StaticFiles(directory="../templates/index.html"), name="uploads")
# app.mount("/", StaticFiles(directory="../templates"), name="uploads")

# Set up the HTML templates folder
templates = Jinja2Templates(directory="../templates")

# Routes for each HTML page
@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/add-customer", response_class=HTMLResponse)
def add_customer(request: Request):
    return templates.TemplateResponse("addCustomer.html", {"request": request})

@app.get("/new-data", response_class=HTMLResponse)
def new_data(request: Request):
    return templates.TemplateResponse("newData.html", {"request": request})