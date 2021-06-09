const multer = require('multer');
const csv = require('fast-csv');
const mongodb = require('mongodb');
const fs = require('fs');
const fastcsv = require("fast-csv");
const router = require('express').Router();
const ws = fs.createWriteStream("Downloaded.csv");
// Set global directory
global.__basedir = __dirname;

// Multer Upload Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __basedir + '/uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname)
    }
});

// Filter for CSV file
const csvFilter = (req, file, cb) => {
    if (file.mimetype.includes("csv")) {
        cb(null, true);
    } else {
        cb("Please upload only csv file.", false);
    }
};
const upload = multer({ storage: storage });

// Upload CSV file using Express Rest APIs
router.post("/upload", upload.single("file"), (req, res) => {
    try {
        if (req.file == undefined) {
            return res.status(400).send({
                message: "Please upload a CSV file!"
            });
        }
        
        // Import CSV File to MongoDB database
        let csvData = [];
        let filePath = __basedir + '/uploads/' + req.file.filename;
        fs.createReadStream(filePath)
            .pipe(csv.parse({ headers: true }))
            .on("error", (error) => {
                throw error.message;
            })
            .on("data", (row) => {
                csvData.push(row);
            })
            .on("end", () => {

                // Establish connection to the database
                var url = "mongodb://localhost:27017/MHDATA";
                var dbConn;
                mongodb.MongoClient.connect(url, {
                    useUnifiedTopology: true,
                }).then((client) => {
                    console.log('DB Connected!');
                    dbConn = client.db();
                    
                    //inserting into the table "objects"
                    var collectionName = 'objects';
                    var collection = dbConn.collection(collectionName);
                    collection.insertMany(csvData, (err, result) => {
                        if (err) console.log(err);
                        if (result) {
                            res.status(200).send({
                                message:
                                    "Upload/import the CSV data into database successfully: " + req.file.originalname,
                            });
                            client.close();
                        }
                        
                    });
                    var myquery = { "Objets": { $in: [ "Iphone", 'Go Pro','Switch' ] } };
                    var newvalues = {$set: {"PoidsIDX": 0} };
                    dbConn.collection('objects').updateMany(myquery, newvalues, function(err, res) {
                        if (err) throw err;
                        console.log(res.result.nModified + " document(s) updated");
                        client.close();
                      });
                      var myquery3 = { "Poids": { $in: [ /^1/, /^2/,/^3/,/^4/,/^5/,/^6/,/^7/,/^8/,/^9/ ] },"$expr": { "$lt": [ { "$strLenCP": "$Poids" },2  ] } };
                      var newvalues3 = {$set: {"PoidsIDX": 1} };
                      dbConn.collection('objects').updateMany(myquery3, newvalues3, function(err, res) {
                          if (err) throw err;
                          console.log(res.result.nModified + " document(s) updated");
                          client.close();
                        });
                    var myquery1 = { "Poids": /^1/ , "$expr": { "$eq": [ { "$strLenCP": "$Poids" }, 2 ] }};
                    var newvalues1 = {$set: {"PoidsIDX": 2} };
                    dbConn.collection('objects').updateMany(myquery1, newvalues1, function(err, res) {
                        if (err) throw err;
                        console.log(res.result.nModified + " document(s) updated");
                        client.close();
                      });
                    var myquery2 = { "Poids": /^2/ , "$expr": { "$lte": [ { "$strLenCP": "$Poids" }, 2 ] }};
                    var newvalues2 = {$set: {"PoidsIDX": 3} };
                    dbConn.collection('objects').updateMany(myquery2, newvalues2, function(err, res) {
                        if (err) throw err;
                        console.log(res.result.nModified + " document(s) updated");
                        client.close();
                      });
                     
                    
                }).catch(err => {
                    res.status(500).send({
                        message: "Fail to import data into database!",
                        error: err.message,
                    });
                });
                
            });
            
    } catch (error) {
        console.log("catch error-", error);
        res.status(500).send({
            message: "Could not upload the file: " + req.file.originalname,
        });
    }
});
  

// Fetch all objects
router.get("/download", function (req, res) {
    // Establish connection to the database
    var url = "mongodb://localhost:27017/MHDATA";
    var dbConn;

    mongodb.MongoClient.connect(url, {
        useUnifiedTopology: true,
    }).then((client) => {
        dbConn = client.db();
        var collectionName = 'objects';
        var collection = dbConn.collection(collectionName);
        collection.find({"PoidsIDX":{$lt:3 }}).toArray(function(err, result) {
            if (err) throw err;
            res.status(200).send({objects : result});
            fastcsv
            .write(result, { headers: true })
            .on("finish", function() {
            console.log("Downloaded successfully!");
          })
          .pipe(ws);
            client.close();
          });
         
    }).catch(err => {
        res.status(500).send({
            message: "Fail to fetch data from database!",
            error: err.message,
        });
    });
});
module.exports = router;