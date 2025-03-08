import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AzureBlobService {
  private accountName = "weavadev";  // ✅ Your Azure Storage Account
  private containerName = "pdfs";    // ✅ Your Azure Blob Container
  private sasToken = "sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2025-04-04T05:04:48Z&st=2025-02-03T21:04:48Z&spr=https&sig=rnnPyfWXTrlHtGtf%2Fwan4PirGI78%2FpXowv6cjtXaRFY%3D"; // ✅ Your Azure SAS Token
  private backendApiUrl = "https://weavadev1.azurewebsites.net"; // ✅ Backend API Base URL

  constructor(private http: HttpClient) {}

  // ✅ Upload File to Azure Blob Storage
  async uploadFile(file: File, folderId: string): Promise<boolean> {
    const blobUrl = `https://${this.accountName}.blob.core.windows.net/${this.containerName}/${file.name}?${this.sasToken}`;

    try {
      const response = await fetch(blobUrl, {
        method: "PUT",
        body: file,
        headers: {
          "x-ms-blob-type": "BlockBlob",
          "Content-Type": file.type
        }
      });

      if (response.ok) {
        console.log("✅ File uploaded successfully:", file.name);
        
        // ✅ After successful upload, call API to get Signed URL
        const signedUrlResponse = await this.getSignedUrl(file.name, folderId);

        if (signedUrlResponse) {
          // ✅ Call setPdf API with the required response data
          await this.setPdf(signedUrlResponse, file.name, folderId);
        }

        return true;
      } else {
        console.error("❌ Upload failed:", response.statusText);
        return false; // Upload failed
      }
    } catch (error) {
      console.error("🚨 Error uploading file:", error);
      return false; // Error occurred
    }
  }

  // ✅ Call API to Get Signed URL After Upload
  async getSignedUrl(fileName: string, folderId: string): Promise<any> {
    const url = `${this.backendApiUrl}/files/getSignedUrl`;
    
    // ✅ Retrieve the authentication token from localStorage
    const user = localStorage.getItem('user');
    if (!user) {
      console.error("❌ No user found in localStorage!");
      return null;
    }
    
    const parsedUser = JSON.parse(user);
    const authToken = parsedUser.authToken; // ✅ Ensure we get the auth token

    if (!authToken) {
      console.error("❌ No authToken found in localStorage!");
      return null;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${authToken}`, // ✅ Add the Bearer Token
      'Content-Type': 'application/json'
    });

    const body = {
      fileNameList: [fileName],
      folderId: folderId
    };

    try {
      const response = await this.http.post(url, body, { headers }).toPromise();
      console.log("✅ Signed URL response:", response);
      return response; // Return response data for setPdf
    } catch (error) {
      console.error("❌ Error getting signed URL:", error);
      return null;
    }
  }

  // ✅ Set PDF API Call after getting Signed URL
  async setPdf(signedUrlResponse: any, fileName: string, folderId: string): Promise<void> {
    const url = `${this.backendApiUrl}/files/pdf`;

    // ✅ Retrieve the authentication token from localStorage
    const user = localStorage.getItem('user');
    if (!user) {
      console.error("❌ No user found in localStorage!");
      return;
    }
    
    const parsedUser = JSON.parse(user);
    const authToken = parsedUser.authToken; // ✅ Ensure we get the auth token

    if (!authToken) {
      console.error("❌ No authToken found in localStorage!");
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${authToken}`, // ✅ Add the Bearer Token
      'Content-Type': 'application/json'
    });

    // ✅ Extract necessary fields from `signedUrlResponse`
    const fileData = signedUrlResponse?.metadata?.requestPayload?.fileNameList[0] || {};
    const fileId = signedUrlResponse[0].id || "";

    if (!fileId) {
      console.error("❌ Missing file ID from signed URL response");
      return;
    }

    const body = {
      "fileSize": fileData.size || 146185,
      "folderId": folderId,
      "host": "https://www.weavatools.com/apis",
      "id": fileId,
      "originalFileName": fileName
    };

    try {
      const response = await this.http.post(url, body, { headers }).toPromise();
      console.log("✅ PDF metadata saved successfully:", response);
    } catch (error) {
      console.error("❌ Error saving PDF metadata:", error);
    }
  }
}
