##
## 1.0 Create Models and Migrations (5) + as we create our models we also want to add any constraints/validations/associations that we can think of

#### 1.1 Create table Spots: (has FK from Users)
```
npx sequelize model:generate --name Spot --attributes ownerId:integer,address:string,city:string,state:string,country:string,lat:decimal,lng:decimal,name:string,description:string,price:decimal
```

#### 1.2 Create table Bookings: (has FK from Users, Spots)
```
npx sequelize model:generate --name Booking --attributes spotId:integer,userId:integer,startDate:DATE,endDate:DATE
```
#### 1.3 Create table SpotImages: (has FK from Spots)
```
npx sequelize model:generate --name SpotImage --attributes spotId:integer,url:string,preview:boolean
```
#### 1.4 Create table Reviews: (has FK from Users, Spots)
```
npx sequelize model:generate --name Review --attributes spotId:integer,userId:integer,review:string,stars:integer
```
#### 1.5 Create table ReviewImages:(has FK from Reviews)
```
npx sequelize model:generate --name ReviewImage --attributes reviewId:integer,url:string
```

## 2.0 Create seeders (5) for each table / model + check in db whether data looks correct

## 3.0 Identify what routes are needed and implement

## 4.0 Begin working on all our routes in the API docs starting from top to bottom
