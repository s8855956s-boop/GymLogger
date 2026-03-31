import { fecthUnsyncedLogs, markLogsAsSynced } from "../db";
import { Log } from "../types";
import backendApis from "./backendApis";

const synchronizeData = async () => {
  try {
    // Fetch local data that needs to be synchronized
    const localData: Log[] = await fecthUnsyncedLogs();
    // Send local data to the backend API
    await backendApis.saveLog(localData);
    const syncedIds = localData
      .map((log) => log.dateId)
      .filter((dateId): dateId is number => dateId !== undefined);

    await markLogsAsSynced(syncedIds);
    console.log("Data to synchronize:", localData);
  } catch (error) {
    console.error("Error synchronizing data:", error);
  }
};

export default synchronizeData;
