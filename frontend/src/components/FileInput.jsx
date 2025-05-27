import React, { useEffect, useState } from "react";
import { createWorker } from "tesseract.js";

export default function FileInput() {
  const [file, setFile] = useState();
  const [text, setText] = useState(""); //stores final prescription as text

  const changeFile = (e) => {
    setFile(e.target.files[0]);
  };

  const readFile = async () => {
    const worker = await createWorker("eng", 1, {
      logger: (m) => console.log(m), // Add logger here
    });

    (async () => {
      const {
        data: { text },
      } = await worker.recognize(file);
      setText(text);
      await worker.terminate();
    })();
  };

  useEffect(() => {
    console.log(text);
  }, [text]);

  return (
    <div class="max-w-sm">
      <form>
        <label class="block">
          <span class="sr-only">Choose profile photo</span>
          <input
            type="file"
            className="block w-full text-sm text-gray-500
        file:me-4 file:py-2 file:px-4
        file:rounded-lg file:border-0
        file:text-sm file:font-semibold
        file:bg-blue-600 file:text-white
        hover:file:bg-blue-700
        file:disabled:opacity-50 file:disabled:pointer-events-none
        dark:text-neutral-500
        dark:file:bg-blue-500
        dark:hover:file:bg-blue-400
      "
            onChange={changeFile}
          />
        </label>
        <input
          type="button"
          value="Submit"
          onClick={readFile}
          className="m-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
        />
      </form>
    </div>
  );
}
