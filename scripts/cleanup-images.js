// Script to clean up placeholder images from existing complaints
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://sravani:sravs-08@tta-urban.glkngls.mongodb.net/tta-urban?retryWrites=true&w=majority';

const ComplaintSchema = new mongoose.Schema({}, { strict: false });
const Complaint = mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema);

async function cleanupImages() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all complaints with placeholder images
    const result = await Complaint.updateMany(
      { 
        images: { 
          $elemMatch: { $regex: /placeholder/ } 
        } 
      },
      { 
        $set: { images: [] } 
      }
    );

    console.log(`Updated ${result.modifiedCount} complaints`);
    console.log('Removed all placeholder image references');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanupImages();
