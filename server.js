const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser');

const Room = require('./models/Room')
const Client = require('./models/Client')

var app = express();

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true}));


mongoose.connect('mongodb://localhost:27017/Beamfox', {useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true} , () => {
    console.log('DB Connected')
});


app.post('/addRoom', (req, res) => {
    // REQ BODY: Array of Room objects
    var rooms = req.body.rooms
    let n = 0;
    let addedRooms = [];
    rooms.forEach(room => {
        var newRoom = new Room(room);
        newRoom.save().then(r => {
            n++;
            console.log('Saved', r)
            addedRooms.push(r);
            if(n === rooms.length)
            {
                res.status(200).json({
                    message : 'Successfully added',
                    addedRooms : addedRooms
                });
            }
        }).catch(e => res.send(e));
    });     
})


app.post('/updateRoom', (req, res) => {    
    // REQ BODY: Entire Room object
    console.log(req.body)
    Room.findOne({_id: req.body._id}).then( room => {
        if(room.bookingStatus.length > 0)
        {
            res.send('Cannot Update. Room is currently booked');
            return;
        }
        Room.findOneAndUpdate({_id: req.body._id}, 
        {
            number: req.body.number,
            type: req.body.type,
            bedCapacity: req.body.bedCapacity,
            rent: req.body.rent,
            address: req.body.address
        })
        .then(r => {
            console.log(r)
            res.status(200).json({
                message : '1 document updated',
                room : r
            });
        })
        .catch(e => res.send(e));
    }).catch(e => res.send(e));
})

app.delete('/deleteRoom', (req, res) => {
    // REQ BODY: _id of the room
    Room.findOne({_id: req.body._id}).then(room => {
        if(room.bookingStatus.length > 0)
        {
            res.send('Cannot Delete. Room is currently booked');
            return;
        }
        Room.deleteOne({ "_id": req.body._id }, function(err, obj) {
        if (err) throw err;
        }).then( x => {
            console.log("1 document deleted")
            res.status(200).json({
                message : '1 document deleted'
            });
        }).catch(e => res.send(e));
    }).catch(e => res.send(e));         
})

app.get('/showRooms', (req, res) => {
    let addr = req.query.address
    let cin = new Date(req.query.checkIn)    //YYYY-MM string
    let cout = new Date(req.query.checkOut)
    let type = req.query.type
    let bedCapacity = req.query.bedCapacity
    let maxRent = req.query.maxRent
    var availableRooms = [];
    if(addr === undefined || cin === undefined || cout === undefined)
    {
        res.send("Insufficient parameters");
        return;
    }
    Room.find( {address: addr} )
    .then(rooms => {
        let i = 0;
        rooms.forEach(room => {
            i++;
            if((type === undefined || room.type === type) && (bedCapacity === undefined || room.bedCapacity == bedCapacity) && (maxRent === undefined || room.rent <= maxRent) )
            {
                availableRooms.push(room);
                console.log(room)
                room.bookingStatus.forEach(booking => {
                    Client.findOne({"_id": booking})
                    .then(b => {
                        console.log(b)
                        if(cout < b.checkIn || cin > b.checkOut)
                        {
                        }
                        else
                        {
                            availableRooms.pop();
                        }
                    }).catch(err => console.log(err));
                });
            }
            if(i === rooms.length )
            {
                res.status(200).json({
                    message : 'Showing Rooms',
                    rooms : availableRooms
                });
            }
        });
    }).catch(err => console.log(err));
});

app.post('/bookRoom/:id', (req, res) => {
    // id : _id of the Room object
    // only those _id's would be entered which are listed after executing showRooms
    // REQ BODY: Client Object
    console.log(req.body)
    var newBooking = new Client(req.body);
    newBooking.roomIds = req.params.id;
    newBooking.save().then(b => {
        console.log('Saved', b);
        Room.findByIdAndUpdate(req.params.id,
            {$push: { bookingStatus: b._id }},
            {safe: true, upsert: true},
            function(err, doc) {
                if(err){
                console.log(err);
                }
            }
        );
    }).catch(e => res.send(e));
    res.status(200).json({
        message : 'Booking Successful'
    });
})

app.get('/showBookings/:id', (req, res) => {
    // id : _id of the Room object
    Room.findOne( {"_id": req.params.id} )
        .then(room => {
            r = {};
            r["Room Details"] = room;
            r["Booking Details"] = [];
            let count=0;
            if(room.bookingStatus.length === 0)
            {
                console.log(room)
                console.log(room.bookingStatus)
                res.status(200).json({
                    Room : r["Room Details"],
                    Bookings : r["Booking Details"]
                });
                return;
            }
            room.bookingStatus.forEach(booking => {

                Client.findOne({"_id": booking})
                .then(b => {
                    count++;
                    console.log(b)
                    r["Booking Details"].push(b);
                    if(count === room.bookingStatus.length) {
                            res.status(200).json({
                                Room : r["Room Details"],
                                Bookings : r["Booking Details"]
                            });
                    }
                }).catch(err => console.log(err));
            });
        }).catch(err => console.log(err));
});

var port = 4300;

app.listen(port, () => {
    console.log('Port Up ' + port);
})