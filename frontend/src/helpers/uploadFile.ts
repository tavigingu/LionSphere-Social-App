const url = `https://api.cloudinary.com/v1_1/dznsk5j68/auto/upload`

interface SimpleCloudinaryResponse {
    secure_url: string;
  }
  
  const uploadFile = async (file: File): Promise<SimpleCloudinaryResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'Social-app');
  
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });
  
    const responseData = await response.json() as SimpleCloudinaryResponse;
    
    return responseData;
  };
  
  export default uploadFile;