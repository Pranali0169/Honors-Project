from sqlalchemy.orm import Session
import models
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError



def add_customer(db: Session, name: str, phone: str, email: str):
    new_customer = models.Customer(name=name, phone=phone, email=email)
    db.add(new_customer)
    # db.commit()
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        # Check if it's a UNIQUE constraint failure
        if 'UNIQUE constraint failed' in str(e.orig):
            # Parse which column failed (optional: improve this)
            if 'name' in str(e.orig):
                raise HTTPException(status_code=400, detail="Name must be unique.")
            else:
                raise HTTPException(status_code=400, detail="Duplicate value violates unique constraint.")
        else:
            raise HTTPException(status_code=500, detail="Database error.")
    db.refresh(new_customer)
    return new_customer


def get_customers(db: Session):
    return db.query(models.Customer).all()

def add_flower(db: Session, name: str, price: float, quantity: int, image_path: str):
    new_flower = models.Flower(name=name, price=price, quantity=quantity, image=image_path)
    db.add(new_flower)
    db.commit()
    db.refresh(new_flower)
    return new_flower

def get_flowers(db: Session):
    return db.query(models.Flower).all()

# def add_bill(db: Session, customer_id: int, flower_id: int, quantity: int, total_price: float):
#     new_bill = models.Bill(customer_id=customer_id, flower_id=flower_id, quantity=quantity, total_price=total_price)
#     db.add(new_bill)
#     db.commit()
#     db.refresh(new_bill)
#     return new_bill




def add_bill(db: Session, customer_id: int, flower_id: int, quantity: int, total_price: float):
    flower = db.query(models.Flower).filter(models.Flower.id == flower_id).first()
    if not flower:
        raise Exception("Flower not found")

    if flower.quantity < quantity:
        raise Exception("Not enough flowers in stock")

    flower.quantity -= quantity  # reduce stock

    new_bill = models.Bill(
        customer_id=customer_id,
        flower_id=flower_id,
        quantity=quantity,
        total_price=total_price
    )

    db.add(new_bill)
    db.commit()
    db.refresh(new_bill)
    return new_bill




### Updated `crud.py` with delete flower functionality ###

# Existing functions...

def delete_flower(db: Session, flower_id: int):
    flower = db.query(models.Flower).filter(models.Flower.id == flower_id).first()
    if flower:
        db.delete(flower)
        db.commit()
        return {"message": "Flower deleted successfully"}
    return {"error": "Flower not found"}
