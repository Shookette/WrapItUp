import { getStorage, ref, uploadBytes } from "firebase/storage";

const updateFile = (file: File) => {
  const storage = getStorage();
  const storageRef = ref(storage, file.name);

  uploadBytes(storageRef, file).then((_snapshot) => {
    console.log("Uploaded a blob or file!");
  });
};

export { updateFile };
