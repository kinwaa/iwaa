const CLIENT_ID_KEY = "wpf_client_id";
const API_JSON_KEY = "wpf_apis";

export class StorageUtils {
   static getClientId(): string | null {
      return localStorage.getItem(CLIENT_ID_KEY);
   }

   static setClientId(clientId: string): void {
      localStorage.setItem(CLIENT_ID_KEY, clientId);
   }

   static removeClientId(): void {
      localStorage.removeItem(CLIENT_ID_KEY);
   }

   static getApiJson(): string | null {
      return localStorage.getItem(API_JSON_KEY);
   }

   static setApiJson(apiJson: string): void {
      localStorage.setItem(API_JSON_KEY, apiJson);
   }

   static removeApiJson(): void {
      localStorage.removeItem(API_JSON_KEY);
   }
}
