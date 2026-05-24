# from sqlalchemy import Column, Integer, String, Float, ForeignKey
# from sqlalchemy.orm import relationship
# from database import Base

# class Customer(Base):
#     __tablename__ = "customers"

#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String, index=True)
#     phone = Column(String, unique=True, index=True)
#     email = Column(String, unique=True, index=True)

#     bills = relationship("Bill", back_populates="customer")

# class Flower(Base):
#     __tablename__ = "flowers"

#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String, index=True)
#     price = Column(Float)
#     quantity = Column(Integer)
#     image = Column(String)  # Path to image file

# class Bill(Base):
#     __tablename__ = "bills"

#     id = Column(Integer, primary_key=True, index=True)
#     customer_id = Column(Integer, ForeignKey("customers.id"))
#     flower_id = Column(Integer, ForeignKey("flowers.id"))
#     quantity = Column(Integer)
#     total_price = Column(Float)

#     customer = relationship("Customer", back_populates="bills")
#     flower = relationship("Flower")






from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    phone = Column(String)
    email = Column(String)

    bills = relationship("Bill", back_populates="customer")

class Flower(Base):
    __tablename__ = "flowers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    price = Column(Float)
    quantity = Column(Integer)
    image = Column(String)

class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    flower_id = Column(Integer, ForeignKey("flowers.id"))
    flower_name = Column(String)
    quantity = Column(Integer)
    total_price = Column(Float)
    gst= Column(Float)
    discount = Column(Float)
    rate_at_purchase = Column(Float)
    purchase_date = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="bills")
    flower = relationship("Flower")

class Passbook(Base):
    __tablename__ = "passbook"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    credit = Column(Float,default = 0)
    debit = Column(Float, default=0)
    total_price = Column(Float)
    date = Column(DateTime, default=datetime.utcnow)