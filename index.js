const express = require("express");
const fs = require("fs");
const zlib = require("zlib");
const status = require("express-status-monitor");
const { pipeline } = require("stream");

const app = express();
const PORT = 3000;

app.use(status());

////////////////// Reading from file and sending chuncks in respose when made request at Path : "/" //////////////////

app.get("/", (req, res) => {
  // Create a read stream for the 'sample.txt' file
  const stream = fs.createReadStream("./sample.txt");
  stream.setEncoding("utf-8"); // Set the encoding of the stream to 'utf-8'

  // Event listener for when data is available to read
  stream.on("data", function (chunk) {
    res.write(chunk); // Write the chunk of data to the response
  });

  // Event listener for when the stream has ended
  stream.on("end", function () {
    console.log("Stream Ended!");
  });

  // Event listener for any errors that occur while reading the file
  stream.on("error", function (err) {
    console.log(err.stack);
  });
});

////////////////// Reading from sample.txt and writing to newfile.txt //////////////////

// Create a read stream for sample.txt
const readStream = fs.createReadStream("./sample.txt", { encoding: "utf-8" });

// Create a write stream for the new file, e.g., newfile.txt
const writeStream = fs.createWriteStream("./newfile.txt");

// Event listener for when data is available to read
readStream.on("data", (chunk) => {
  writeStream.write(chunk); // Write the chunk of data to the new file
});

// Event listener for when the read stream has ended
readStream.on("end", () => {
  writeStream.end(); // End the write stream
  console.log("Write completed successfully!");
});

// Event listener for any errors that occur while reading the file
readStream.on("error", (err) => {
  console.error("Error reading file:", err);
});

// Event listener for any errors that occur while writing to the file
writeStream.on("error", (err) => {
  console.error("Error writing file:", err);
});

////////////////// Function to compress a file using the pipeline API //////////////////
function compress(inputFile, outputFile) {
  // Set up a pipeline to read, compress, and write data
  pipeline(
    fs.createReadStream(inputFile), // Stream data from the input file
    zlib.createGzip(), // Compress the data using Gzip
    fs.WriteStream(outputFile), // Write the compressed data to the output file
    (err) => {
      // Callback to handle success or failure
      if (err) {
        console.log(`Compression Failed`, err);
      } else {
        console.log(`Compression Succeeded`);
      }
    }
  );
}

compress("./sample.txt", "./sample.zip");

app.listen(PORT, () => {
  console.log(`Server started at ${PORT}`);
});
