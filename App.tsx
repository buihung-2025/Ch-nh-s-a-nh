
import React, { useState, useCallback, useRef } from 'react';
import { AttireOption, PhotoSize, BackgroundColor } from './types';
import { fileToBase64 } from './utils/fileUtils';
import { editIdPhoto } from './services/geminiService';
import { UploadIcon, DownloadIcon, SparklesIcon, ResetIcon } from './components/IconComponents';
import Loader from './components/Loader';

const App: React.FC = () => {
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // New state for customization
  const [photoSize, setPhotoSize] = useState<PhotoSize>(PhotoSize.ThreeFour);
  const [backgroundColor, setBackgroundColor] = useState<BackgroundColor>(BackgroundColor.Blue);
  const [attire, setAttire] = useState<AttireOption>(AttireOption.Original);
  const [beautify, setBeautify] = useState<boolean>(true);
  const [smoothSkin, setSmoothSkin] = useState<boolean>(true);
  const [makeup, setMakeup] = useState<boolean>(false);


  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleReset(); // Reset if a new image is selected
      setOriginalImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setOriginalImagePreview(previewUrl);
    } else {
      setError("Vui lòng chọn một tệp hình ảnh hợp lệ (JPEG, PNG, v.v.).");
    }
  };

  const handleGenerateClick = useCallback(async () => {
    if (!originalImageFile) {
      setError("Vui lòng chọn một hình ảnh để bắt đầu.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedImage(null);

    try {
      const base64Image = await fileToBase64(originalImageFile);
      const result = await editIdPhoto(
        base64Image,
        originalImageFile.type,
        attire,
        photoSize,
        backgroundColor,
        beautify,
        smoothSkin,
        makeup
      );
      setEditedImage(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định.");
    } finally {
      setIsLoading(false);
    }
  }, [originalImageFile, attire, photoSize, backgroundColor, beautify, smoothSkin, makeup]);
  
  const handleReset = () => {
    setOriginalImageFile(null);
    if(originalImagePreview) {
        URL.revokeObjectURL(originalImagePreview);
    }
    setOriginalImagePreview(null);
    setEditedImage(null);
    setIsLoading(false);
    setError(null);
    // Reset options to default
    setPhotoSize(PhotoSize.ThreeFour);
    setBackgroundColor(BackgroundColor.Blue);
    setAttire(AttireOption.Original);
    setBeautify(true);
    setSmoothSkin(true);
    setMakeup(false);

    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };
  
  const OptionButton = ({ label, onClick, isActive, disabled }: { label: string, onClick: () => void, isActive: boolean, disabled: boolean }) => (
      <button
          onClick={onClick}
          disabled={disabled}
          className={`w-full p-3 text-center rounded-lg border-2 transition-all text-sm font-medium ${
            isActive
              ? 'bg-primary text-white border-primary shadow-md'
              : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {label}
      </button>
  );

  const CheckboxOption = ({ label, checked, onChange, disabled }: { label: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, disabled: boolean }) => (
    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border has-[:checked]:bg-primary-50 has-[:checked]:border-primary-400">
      <span className="font-medium text-gray-700">{label}</span>
      <input 
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary-500"
      />
    </label>
  );


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-6xl text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">
          Trình Chỉnh Sửa Ảnh Thẻ AI
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Tải ảnh lên để tự động tạo ảnh thẻ chuyên nghiệp chỉ trong vài giây.
        </p>
      </header>

      <main className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl p-6 md:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 relative">
        {/* Left Panel: Upload and Options */}
        <div className="flex flex-col space-y-6">
          <h2 className="text-2xl font-semibold text-gray-700 border-b pb-3">1. Tải Ảnh Gốc</h2>
          
          <div 
            className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-center cursor-pointer hover:border-primary-500 hover:bg-gray-50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />
            {originalImagePreview ? (
              <img src={originalImagePreview} alt="Ảnh gốc" className="max-h-full max-w-full object-contain rounded-md" />
            ) : (
              <div className="text-gray-500">
                <UploadIcon className="mx-auto h-12 w-12" />
                <p className="mt-2">Nhấn để chọn ảnh hoặc kéo thả vào đây</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP</p>
              </div>
            )}
          </div>

          {originalImageFile && (
            <>
              <h2 className="text-2xl font-semibold text-gray-700 border-b pb-3 pt-4">2. Tùy Chỉnh</h2>
              <div className='space-y-4'>
                <div>
                    <h3 className="text-base font-semibold text-gray-600 mb-2">Kích Cỡ</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <OptionButton label="3x4" onClick={() => setPhotoSize(PhotoSize.ThreeFour)} isActive={photoSize === PhotoSize.ThreeFour} disabled={isLoading} />
                        <OptionButton label="4x6" onClick={() => setPhotoSize(PhotoSize.FourSix)} isActive={photoSize === PhotoSize.FourSix} disabled={isLoading} />
                    </div>
                </div>
                <div>
                    <h3 className="text-base font-semibold text-gray-600 mb-2">Phông Nền</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <OptionButton label="Nền Trắng" onClick={() => setBackgroundColor(BackgroundColor.White)} isActive={backgroundColor === BackgroundColor.White} disabled={isLoading} />
                        <OptionButton label="Nền Xanh" onClick={() => setBackgroundColor(BackgroundColor.Blue)} isActive={backgroundColor === BackgroundColor.Blue} disabled={isLoading} />
                    </div>
                </div>
                <div>
                    <h3 className="text-base font-semibold text-gray-600 mb-2">Trang Phục</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <OptionButton label="Giữ Trang Phục Gốc" onClick={() => setAttire(AttireOption.Original)} isActive={attire === AttireOption.Original} disabled={isLoading} />
                        <OptionButton label="Sơ Mi Thời Trang" onClick={() => setAttire(AttireOption.Shirt)} isActive={attire === AttireOption.Shirt} disabled={isLoading} />
                        <OptionButton label="Vest Công Sở" onClick={() => setAttire(AttireOption.Suit)} isActive={attire === AttireOption.Suit} disabled={isLoading} />
                        <OptionButton label="Áo Dài" onClick={() => setAttire(AttireOption.AoDai)} isActive={attire === AttireOption.AoDai} disabled={isLoading} />
                    </div>
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-gray-700 border-b pb-3 pt-4">3. Cải Thiện (Tùy chọn)</h2>
               <div className="space-y-3">
                  <CheckboxOption label="Làm đẹp ảnh" checked={beautify} onChange={(e) => setBeautify(e.target.checked)} disabled={isLoading} />
                  <CheckboxOption label="Làm mịn da" checked={smoothSkin} onChange={(e) => setSmoothSkin(e.target.checked)} disabled={isLoading} />
                  <CheckboxOption label="Trang điểm nhẹ nhàng" checked={makeup} onChange={(e) => setMakeup(e.target.checked)} disabled={isLoading} />
               </div>

              <div className="pt-6">
                <button
                  onClick={handleGenerateClick}
                  disabled={isLoading || !originalImageFile}
                  className="w-full bg-primary text-white font-bold py-4 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <SparklesIcon className="h-6 w-6" />
                  <span>{isLoading ? 'Đang xử lý...' : 'Tạo Ảnh Thẻ'}</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right Panel: Result */}
        <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-4 min-h-[500px]">
          {isLoading ? (
            <Loader message="AI đang tạo ảnh của bạn..." />
          ) : error ? (
            <div className="text-center text-red-600">
              <p className="font-semibold">Đã xảy ra lỗi</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          ) : editedImage ? (
            <div className='w-full flex flex-col items-center space-y-4'>
                <img src={editedImage} alt="Ảnh đã chỉnh sửa" className="max-w-full max-h-[400px] object-contain rounded-lg shadow-lg" />
                <a
                  href={editedImage}
                  download={`anh-the-${new Date().toISOString()}.png`}
                  className="w-full max-w-xs bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300 transition-transform transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                    <DownloadIcon className="h-5 w-5" />
                    <span>Tải Ảnh Về</span>
                </a>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <SparklesIcon className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-xl font-semibold">Ảnh Của Bạn Sẽ Xuất Hiện Ở Đây</h3>
              <p className="mt-1 text-sm">Tải lên một hình ảnh và chọn các tùy chỉnh để bắt đầu.</p>
            </div>
          )}

          {(originalImageFile || editedImage) && !isLoading && (
             <button 
                onClick={handleReset} 
                className='absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors'
                aria-label="Bắt đầu lại"
             >
                <ResetIcon className='h-6 w-6'/>
             </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
