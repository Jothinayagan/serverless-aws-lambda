const aws = require("aws-sdk");
const csv2json = require("csvtojson");
const json2csv = require("json-2-csv");

module.exports.triggerS3Operations = async (event, _context, _callback) => {
    console.log(`Event object: ${event}`);
    try {
        console.log(`Lambda process STARTED!`);

        aws.config.setPromisesDependency();

        const s3 = new aws.S3();

        console.log(`Initiated s3 from AWS-SDK!`);

        const data = s3
            .getObject({
                Bucket: "src-kitten",
                Key: "realestate.csv",
            })
            .createReadStream();

        console.log(`realestate.csv read stream operation: DONE!`);

        const res = await csv2json().fromStream(data);

        console.log(`Steamed data - json convertio: DONE!`);

        const conJsonData = req.map((data) => {
            return {
                street: data.street,
                city: data.city,
                state: data.state,
                zip: data.zip,
                type: data.type,
                price: data.price,
            };
        });

        console.log(`JSON data is consolidate: DONE!`);
        console.log(`JSON - CSV string convertion beginning...`);

        const convertedCsvData = await json2csv.json2csvAsync(
            conJsonData,
            (err, csv) => {
                if (err) return err;
                return csv;
            }
        );

        console.log(`JSON - CSV string convertion OVER!`);
        console.log(`ConvertedCsvData => ${convertedCsvData}`);

        const params = {
            Bucket: "dest-kitten",
            Key: "consolidate-realestate.csv",
            Body: Buffer.from(convertedCsvData),
        };

        console.log(`Param creation for s3 target bucket: DONE!`);
        console.log(`s3 bucket writing process going to start!!!`);

        await s3
            .putObject(params)
            .promise()
            .then((data) => {
                console.log(`File uploaded successfull - data ${data}`);
                console.log(`Lambda operation over: SIGNING OFF!!`);
            })
            .catch((err) => console.log(`Error occured at putObject: ${err}`));
    } catch (e) {
        console.log(`Error occured: ${e}`);
    }
};
