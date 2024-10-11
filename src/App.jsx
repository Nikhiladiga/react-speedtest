import { useState } from "react";
import ndt7 from "@m-lab/ndt7";

const App = () => {
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [complete, setComplete] = useState(true);
  const [testTime, setTestTime] = useState(0);

  const startSpeedtest = () => {
    // Reset state variables
    setDownloadSpeed(0);
    setUploadSpeed(0);
    setTestTime(0);
    setComplete(false);

    const startTime = Date.now();
    ndt7
      .test(
        {
          userAcceptedDataPolicy: true,
          downloadworkerfile: "/ndt7-download-worker.min.js",
          uploadworkerfile: "/ndt7-upload-worker.min.js",
          metadata: {
            client_name: "speedtest-sample",
          },
        },
        {
          // Get download speed
          downloadMeasurement: function (data) {
            if (data.Source === "client") {
              setDownloadSpeed(data.Data.MeanClientMbps.toFixed(2) + " Mb/s");
            }
          },
          downloadComplete: function (data) {
            const clientGoodput = data.LastClientMeasurement.MeanClientMbps;
            setDownloadSpeed(clientGoodput.toFixed(2) + "Mb/s");
          },

          // Get upload speed
          uploadMeasurement: function (data) {
            if (data.Source === "server") {
              setUploadSpeed(
                (
                  (data.Data.TCPInfo.BytesReceived /
                    data.Data.TCPInfo.ElapsedTime) *
                  8
                ).toFixed(2) + " Mb/s"
              );
            }
          },
          uploadComplete: function (data) {
            const bytesReceived =
              data.LastServerMeasurement.TCPInfo.BytesReceived;
            const elapsed = data.LastServerMeasurement.TCPInfo.ElapsedTime;
            const throughput = (bytesReceived * 8) / elapsed;
            setUploadSpeed(throughput.toFixed(2) + "Mb/s");
          },

          error: function (err) {
            console.log("Error while running the test:", err.message);
            setComplete(false);
          },
        }
      )
      .then((exitcode) => {
        setTestTime((Date.now() - startTime) / 1000);
        setComplete(true);
      });
  };

  return (
    <div className="container">
      <button onClick={startSpeedtest} disabled={!complete}>
        {complete ? "Start Test" : "Running..."}
      </button>

      <div className="measurement-container">
        <div className="measurement">
          <h1>Download Speed</h1>
          <div className="speed-value">{downloadSpeed || "0 Mb/s"}</div>
        </div>

        <div className="measurement">
          <h1>Upload Speed</h1>
          <div className="speed-value">{uploadSpeed || "0 Mb/s"}</div>
        </div>
      </div>

      <div className="test-time">Test Duration: {testTime || 0} seconds</div>
    </div>
  );
};

export default App;
