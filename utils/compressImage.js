import sharp from "sharp";
import fs from "fs";
import path from "path";
import { v4 as uuIdv4 } from "uuid";

export async function convertToWebp(inputFilename, req) {
    try {
        const outputDirectory = "images";
        const dimensions = [
            { width: 200, height: 200 },
            { width: 400, height: 400 },
            { width: 600, height: 600 },
        ];

        return dimensions.map((dimension) => {
            const outputFilename = `${path.parse(inputFilename).name}_${
                dimension.width
            }x${dimension.height}.webp`;

            sharp(inputFilename, { failOn: "truncated" })
                .resize(dimension.width, dimension.height)
                .toFormat("webp", {
                    quality: 50,
                    sequentialRead: false,
                })
                .toFile(outputFilename, async (err, info) => {
                    if (err) {
                        console.log({ error: err });
                        return { error: err };
                    } else {
                        moveFile(
                            path.resolve() + "\\" + outputFilename,
                            path.resolve() + "\\" + outputDirectory
                        );
                    }
                });
            return outputFilename;
        });
    } catch (error) {
        // return { error };
        console.log(1, error);
    }
}
async function moveFile(source, destination) {
    await fs.promises.mkdir(destination, { recursive: true });
    await fs.promises.rename(
        source,
        path.join(destination, path.basename(source))
    );
}

// export async function removePic(filePath) {
//     // open file as read and write
//     const fileHandle = await fs.promises.open(filePath, "r+");
//     // close file and try to unlink file from directory
//     await fileHandle.close();

//     await new Promise((resolve) => {
//         setTimeout(resolve, 2000); // زمن انتظار لمدة ثانية واحدة (يمكن تعديله حسب الحاجة)
//     });

//     await fs.promises.unlink(filePath);
// }

export async function removePic(filePath) {
    try {
        // open file as read and write
        const fileHandle = await fs.promises.open(filePath, "r+");
        // close file and try to unlink file from directory
        await fileHandle.close();

        await new Promise((resolve) => {
            setTimeout(resolve, 2000); // زمن انتظار لمدة ثانية واحدة (يمكن تعديله حسب الحاجة)
        });

        await fs.promises.unlink(filePath);
    } catch (error) {
        if (error.code === "ENOENT") {
        }
    }
}

// Usage example
const inputFilename = "input.png";
// convertToWebp(inputFilename, req);
