# RoomRentalService
It contains the REST API in Node.js for a room booking service.  
MongoDB has been used for database operations.  
The API has been hosted on AWS-ec2 server on PORT 4300, accessible through ubuntu@ec2-18-220-189-81.us-east-2.compute.amazonaws.com.  
On this ec2 instance only http and https requests are accepted.  
To route the incoming traffic from PORT 80 to the application PORT, I have used nginx reverse proxy.  
This has been done keeping in mind the security and load balancing needs.

It can perform following functions -
1) Add Rooms
2) Update Room (if it is not currently booked)
3) Delete Room (if it is not currently booked)
4) Show Rooms with the given filters if they are available
5) Book Room
6) Show Bookings of a particular room
