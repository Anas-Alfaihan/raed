import QrCode from "qrcode";

// النص الذي تريد تحويله إلى QR code
const text = "مرحبًا، هذا هو QR code!";

const options = {
    errorCorrectionLevel: "H", // مستوى تصحيح الأخطاء، يمكن أن يكون: L, M, Q, H
    type: "png", // نوع الصورة المُنشأة، يمكن أن يكون: png, svg, pdf, eps
    quality: 0.92, // جودة الصورة (من 0 إلى 1)
    margin: 1, // هامش الصورة
};

// إنشاء QR code وحفظها في ملف
QrCode.toFile("QrCode.png", text, options, (error) => {
    if (error) throw error;
    console.log("تم إنشاء الـ QR code بنجاح!");
});

// إنشاء QR code وعرضها مباشرةً في المتصفح
QrCode.toDataURL(text, options, (error, url) => {
    if (error) throw error;
    console.log("تم إنشاء الـ QR code بنجاح!");
    console.log(url, 1); // رابط الصورة المُنشأة
});

// //  إنشاء QR code والحصول على البيانات المُشفرة بصيغة نص
// QrCode.toString(text, options, (error, string) => {
//     if (error) throw error;
//     console.log("تم إنشاء الـ QR code بنجاح!");
//     console.log(string); // النص المُشفر في شكل سلسلة نصية
// });
