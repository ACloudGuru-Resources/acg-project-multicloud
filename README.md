# MultiCloudGuruChallenge

This repo contains some code used in an ACG Project showing how I completed the [January 2021 #CloudGuruChallenge](https://acloudguru.com/blog/engineering/cloudguruchallenge-multi-cloud-madness) from A Cloud Guru.  There were any number of ways to complete this challenge so this shouldn't be considered "THE" solution.  Rather, it represents some technologies that I wanted to learn about.


| Step                                                                  | Platform | Service(s)         |
|-----------------------------------------------------------------------|:--------:|--------------------|
| 1. Capture picture from webcam.                                          |  Browser | HTML5 / Javascript |
| 2. Upload image to online storage service.                               |    AWS   | S3                 |
| 3. Trigger serverless function to call out to Image Recognition Service. |    AWS   | Lambda             |
| 4. Use Image Recognition Service to tell us about the image.             |   Azure  | Vision             |
| 5. Store metadata and path to image in NoSQL database.                   |    GCP   | Firestore          |


> NOTE: People sometimes regard technology choice with all the energy and fervor as one's choice of favorite pizza toppings or a favorite sports team.  There are no shortage of people out there offering opinions on why one framework is "clearly superior" to another framework and why you should learn this thing and not waste time on that other thing.  Look, this is YOUR learning journey and YOU get to decide what path you take.  A rich learning journey isn't just blindly replicating a series of flawless steps...that just teaches you how to follow instructions.  You also need all those dead-ends, frustrations and do-overs so that you can operate with intuition.  

## Step 1 - Capture picture from webcam

It was relatively easy to find some snippets of HTML5 and Javascript to capture an image on both a desktop machine as well as a mobile browser.  [Sam Dutton's simpl repo](https://github.com/samdutton/simpl) is an excellent resource for all sorts of examples on doing stuff with HTML, CSS and Javascript.

However, I wanted to get some hands-on work with a decent modern framework rather than just cobble together some hack code.  Well, my code may still be hack code but at least it will be hack code in a framework...and that is progress. To give me a starting point, I watched Brock Tubre's [Building and Deploying an Angular App](https://learn.acloud.guru/handson/23d76e0d-8298-4200-a93c-c51fc22f8828) on the ACG platform.  After messing around with Angular a bit, I managed to get a basic app that could capture an image, but it was more challenging and complex than I had initially expected, going into Angular for the first time.  I soon wondered what the same thing might look like if done in a different framework to compare and contrast approaches.  I've heard good things about Vue.js, so I figured why not try to recreate my image capture app in Vue.js.

For me, the learning curve for Vue.js was much more accessible than my exploration with Angular.  This is understandable as Angular is designed to be used in large complex applications and is, as a result, very broad.  With the help of a [handy webcam component from NPM](https://www.npmjs.com/package/vue-web-cam), I had a clone of my Angular app working in about 30 minutes.  I spend some more time refactoring such that I tried to do things in the Vue.js framework way rather than my old brute-force Javascript way.


## Step 2 - Upload image to an online storage service.

I'm selecting AWS S3 as the storage layer for this method.  We could just use a [simple POST with hardcoded credentials](https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-post-example.html) but I wanted to make use of AWS Amplify as it has very nifty integrations into AWS Cognito, AWS S3 and many other AWS services.  There are several entry-level tutorials for getting started with Amplify, including ones tailored for [Angular](https://docs.amplify.aws/start/q/integration/angular) and [Vue.js](https://docs.amplify.aws/start/q/integration/vue).  I also watched parts of Ryan Brown's [Introduction to AWS AppSync](https://acloud.guru/overview/intro-aws-appsync) on the ACG platform to help me figure out the Amplify authentication bits.

I was very surprised at how fast I was able to setup authentication and file upload using the Amplify libraries.  I added hosting via the Amplify CLI and published the app.  Amplify took care of uploading to an S3 bucket and created a CloudFront CDN endpoint for my app.  Now that I am able to capture an image and upload to an online storage service, it's time to move on to the image processing step.

## Step 3 - Trigger serverless function to call out to Image Recognition Service

AWS S3, like the block storage offerings from other cloud providers, supports events.  These events can be triggered when a variety of things happen to your storage bucket or the objects contained within.  I can configure an event to fire whenever a file with the .JPG extension is uploaded, which I can then hook to a serverless function to do work.  On AWS, these events are called S3 Events and the serverless function service is called Lambda.  I can configure an S3 Event to listen for a file to be uploaded, then immediately trigger a Lambda function to do stuff.

I know from experience that trying to develop a serverless Lambda function can be lots of trial and error before you can get everything just right, so I want to do all that business locally.  So, I installed the [Serverless Framework](https://www.serverless.com/) to help me test out things locally instead of constantly deploying.  The Serverless Framework even includes examples of deploying Lambda functions and Vue.js apps, but I opted for more manual methods.  One of the cool things about the Serverless Framework is that it supports [many different cloud providers](https://www.serverless.com/framework/docs/providers/) so if you learn the ropes with one provider, it generally translates over to other providers.  However, do know that the depth of support and capabilities for each platform varies so it's not as if anything you create on AWS can be seamlessly deployed to Alibaba Cloud for example.

After fussing around with various renditions of function code, I settled on using REST calls as much as possible.  REST is a common way cloud providers expose their APIs so I thought that sticking to that method was best.  (Two exceptions to a pure REST approach though that I'll go into later.)   After some googling, I found several popular REST helper libraries for Node.js.  Of course, we could do REST calls in Node with just using the build-in standard HTTPS library, but a tried and true rule of development is, when possible, leverage other people's work to make your work simpler.  [Axios](https://github.com/axios/axios) is a popular node library that many seem to endorse so I gave that a try.  After more refactoring, I managed to get the main logic flow and separated core logic in line with [AWS's Lambda Best Practice](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html) suggestions.  I wouldn't say it represents a references architecture but it gets the job done.

## Step 4 - Use Image Recognition Service to tell us about the image.

Now it was time to explore Azure.  As I haven't used Azure in the past, I needed a little primer to get me started, and I found that in the [Creating a Cognitive Services Resource Using the Azure Portal](https://learn.acloud.guru/handson/2a74fc95-495d-41fe-9eb0-83a47fd203f8) hands-on lab.  I was quickly able to setup a Vision API endpoint and generate a key.  I used [Postman](https://www.postman.com/) to get the REST API call right and generate some sample code for my Axios library.  I will say that I really liked the Azure Cognitive Services API Explorer and could have used that to figure out the right REST call, but I decided to use Postman for the [stub code](https://en.wikipedia.org/wiki/Method_stub) generation. 

Now that I had the REST call for the image recognition figured out, I needed to fetch the image from the S3 storage.  The first exception to my "All REST" approach was to use the AWS SDK to fetch the binary image from storage.  Because Lambda has the AWS-SDK built in, I chose to just use that to get the image from S3--no real need to over-complicate matters.  I build the REST headers, parameters and body using the help from Postman and before I knew it, I had a successful REST call to the Azure Vision API.

Now, one thing you'll note is that I am storing the API Key as an environment parameter for the Lambda function.  While this is definitely better than hard-coding it into the Lambda code, some will scoff at me being so cavalier with my API keys.  Well, if this were an enterprise app, I'd probably want to use something like AWS Secrets Manager, but for our project, that just seemed to be unnecessary.  The only people who can see this key are those who have access to the properties of this Lambda function...and that's just me.  It's not like we are embedding this API key in a script that gets distributed to clients...this only lives in the Lambda metadata and is included in the REST call encrypted using HTTPS.

## Step 5 - Store metadata and path to image in NoSQL database.

Now that I was getting back a JSON string from the Azure API, I needed to create a place to store it.  I headed out to the Google Cloud Platform to set things up there.  Initially, I dove into [Firebase](https://firebase.google.com/), which is a whole integrated development platform unto itself--its similar to AWS Amplify in that it encompasses many different services geared toward app development teams.  After poking around a bit, I realized that I could just use [Google Firestore](https://cloud.google.com/firestore) because all I needed was a NoSQL database.  I created a collection and then created my first sample record (aka document in [Document Databases](https://en.wikipedia.org/wiki/Document-oriented_database)).

This brings me to the second exception to my "All REST" approach--the GCP authentication.  Google Firestore has a REST API that's pretty well documented, but the security setup required to call the REST API wasn't that well explained at all.  As far as I could tell, there was no way to call it using a bearer token approach like the Azure API used.  I quickly realized that I'd need a whole REST subsystem to generate a token from GCP so I could put it into the header of the Firestore call.  Instead, I took the advice of the [GCP Authentication documentation](https://cloud.google.com/docs/authentication/production) and just used the helper library and the Application Default Credentials functionality.  This indeed saved lines of code and hours of work.  Using the `google_auth_library` module, I was able to pass along the credentials generated for my service account and get back a token which I could use inside the header of the REST call.  With that bit sorted, I almost have a full working flow.  

## All Together Now

Well, with all the pieces working under my local serverless setup, it was time to push it to the cloud.  The Serverless Framework made this trivial and soon enough I was looking at my Lambda function in the AWS console.  I started testing and ran into a problem...  I was getting an error back from the Lambda function saying "No such object" or something similar.  I had narrowed it down to being cause by the AWS SDK call out to S3 to get the S3 file.  This error hadn't occurred when I was testing locally, with the same exact JSON event file.  After spending a long while checking all the complicated things, I was left with only simple things...of which this was one.  Turns out, when the event is fed into Lambda on AWS, there is some [URI encoding](https://en.wikipedia.org/wiki/Percent-encoding) that happens to the contents of the event.  This means that instead of my path to my S3 object being something like `//path-to-my-object/image.jpg`, it was more like `//%2F%2Fpath-to-my-object%2Fimage.jpg`.  As I was feeding this into my S3 GET method, it was looking for something with literally that path and wasn't finding it.   So, I needed to decode the URL encoding and that brought it back to the correct format.

After that was squared away, I was able to successfully upload my images and their metadata appeared in the Firestore database within about 2-3 seconds!  OH YEAH!





