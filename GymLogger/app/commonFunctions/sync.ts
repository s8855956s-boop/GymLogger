import { fecthUnsyncedLogs, markLogsAsSynced } from "../db";
import { Log } from "../types";
import backendApis from "./backendApis";

export type SyncResult = "success" | "error" | "empty";

const synchronizeData = async (): Promise<SyncResult> => {
  try {
    // Fetch local data that needs to be synchronized
    const localData: Log[] = await fecthUnsyncedLogs();
    if (localData.length === 0) {
      return "empty";
    }
    // Send local data to the backend API
    await backendApis.saveLog(localData);
    const syncedIds = localData
      .map((log) => log.dateId)
      .filter((dateId): dateId is number => dateId !== undefined);

    await markLogsAsSynced(syncedIds);
    console.log("Data to synchronize:", localData);
    return "success";
  } catch (error) {
    console.error("Error synchronizing data:", error);
    return "error";
  }
};

export default synchronizeData;
