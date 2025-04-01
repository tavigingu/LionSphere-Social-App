// const url = `https://api.cloudinary.com/v1_1/dznsk5j68/auto/upload`

// interface SimpleCloudinaryResponse {
//     secure_url: string;
//   }
  
//   const uploadFile = async (file: File): Promise<SimpleCloudinaryResponse> => {
//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('upload_preset', 'Social-app');
  
//     const response = await fetch(url, {
//       method: 'POST',
//       body: formData
//     });
  
//     const responseData = await response.json() as SimpleCloudinaryResponse;
    
//     return responseData;
//   };
  
//   export default uploadFile;

const url = `https://api.cloudinary.com/v1_1/dznsk5j68/auto/upload`;

interface SimpleCloudinaryResponse {
  secure_url: string;
  public_id?: string;
  format?: string;
  version?: number;
}

const uploadFile = async (file: File): Promise<SimpleCloudinaryResponse> => {
  console.log("Starting file upload, file type:", file.type, "size:", file.size, "bytes");
  
  if (!file || file.size === 0) {
    throw new Error("Invalid or empty file provided for upload");
  }
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'Social-app');
  
  // Optional: Add these parameters for better control
  formData.append('quality', 'auto');
  formData.append('fetch_format', 'auto');

  try {
    console.log("Sending upload request to Cloudinary...");
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Upload failed with status:", response.status, errorText);
      throw new Error(`Upload failed: ${response.status} ${errorText}`);
    }
    
    const responseData = await response.json() as SimpleCloudinaryResponse;
    console.log("Upload successful, received URL:", responseData.secure_url.substring(0, 50) + "...");
    
    return responseData;
  } catch (error) {
    console.error("Error in uploadFile:", error);
    throw error;
  }
};

export default uploadFile;