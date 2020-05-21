const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
// const session = require('express-session');

// const passport = require('passport');
const Room = require('./models/Room')
const Client = require('./models/Client')

var app = express();

// require('./config/passport')(passport);

app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true}));



mongoose.connect('mongodb://localhost:27017/Beamfox', {useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true} , () => {
    console.log('DB Connected')
});

var db = mongoose.connection;
// app.set('view engine', 'ejs');
// app.use(express.static('views'));

// app.use(session({
//     name: "session",
//     secret: "rsty",
//     key: "key",
//     resave: true,
//     saveUninitialized: true
// }));
// app.use(passport.initialize());
// app.use(passport.session());
// app.use('/auth',require('./routes/auth'));

// app.get('/', (req, res) => {                       // Renders Home Page
//     res.render('index', {req});
// })

app.post('/addRoom', (req, res) => {              // POST Request to save data of Company   
    var rooms = req.body.rooms
    rooms.forEach(room => {
        var newRoom = new Room(room);
        newRoom.save().then(r => {
            console.log('Saved', r);
            res.status(200).json({
                message : 'Successfully added'
            });
        });
    });
})

app.post('/bookRoom/:id', (req, res) => {                
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

app.post('/updateRoom', (req, res) => {                 
    // REQ BODY: Entire room object in the form of schema
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
    }).catch(e => {res.send(e)});
})

app.delete('/deleteRoom', (req, res) => {
    Room.findOne({_id: req.body._id}).then(async room => {
        if(room.bookingStatus.length > 0)
        {
            await res.send('Cannot Delete. Room is currently booked');
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
    var availableRooms = [];
    Room.find( {address: addr} )
    .then(rooms => {
        rooms.forEach(room => {
            availableRooms.push(room);
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
                        res.status(200).json({
                            message : 'Showing Rooms',
                            rooms : availableRooms
                        });
                    }
                });
            })
        });
    }).catch(err => console.log(err));
});

app.get('/showBookings/:id', (req, res) => {
    Room.findOne( {"_id": req.params.id} )
        .then(room => {
            r = {};
            r["Room Details"] = room;
            r["Booking Details"] = [];
            let count=0;
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

app.get('/showRooms/filter/', (req, res) => {
    Room.findById(req.params.id)
    .then(room => {
        room.find({address: {$in: room.address} })
        .then(rooms => {
            console.log(rooms);
            res.status(200).json({
                rooms : rooms
            });
        })
    })
    .catch(err => console.log(err));
});


var port = 4300;

app.listen(port, () => {
    console.log('Port Up' + port);
})