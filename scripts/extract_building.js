const sharp = require('sharp');

async function extractHospitalBuilding() {
  const file = 'C:/Users/User/Downloads/Modern Hospital Data Dashboard Banner.png';
  const img = sharp(file);

  // Extract from x=1550 to 2160, y=100 to 650
  await img.clone()
    .extract({ left: 1550, top: 100, width: 600, height: 500 })
    .toFile('public/uploads/test_hospital_building.png');
  console.log('Saved test_hospital_building.png');
}

extractHospitalBuilding().catch(console.error);
