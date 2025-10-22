import { getStorage, ref, uploadBytes } from "firebase/storage";

const updateFile = (file: File) => {
  const storage = getStorage();
  const storageRef = ref(storage, file.name);

  uploadBytes(storageRef, file).then((snapshot) => {
    console.log("Uploaded a blob or file!");
  });
};
