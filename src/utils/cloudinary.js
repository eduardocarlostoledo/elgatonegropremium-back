const {v2}=require('cloudinary');

const uploadImage= async(filePath)=>{
    return await v2.uploader.upload(filePath,{
        //nombre de la carpeta en cloudinary
        folder : 'Products'
    })
}

const deleteImage= async(id)=>{
    return await v2.uploader.destroy(id)
}

v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure:true
})


module.exports={uploadImage,deleteImage}