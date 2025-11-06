import React, { useState, useReducer, useCallback, ChangeEvent, useEffect } from 'react';
import { Button } from './common/Button';
import { Select } from './common/Select';
import { Card } from './common/Card';
import { Loader } from './common/Loader';
import { UploadIcon, DownloadIcon, RefreshIcon, SparklesIcon, FullscreenIcon, CloseIcon, ArrowLeftIcon, ArrowRightIcon, CubeIcon } from './common/Icons';
import { generateImages, generateCaptions, analyzeImageType, generateBlankProductMockup } from '../services/geminiService';
import type { GeneratorFormState, UploadedFile, GeneratedImage, Captions } from '../types';
import * as C from '../constants';

const initialState: Omit<GeneratorFormState, 'projectName'> = {
  description: '',
  platformTarget: C.PLATFORM_TARGETS[0],
  cameraAngle: C.CAMERA_ANGLES[0],
  shootingDevice: C.SHOOTING_DEVICES[0],
  cameraModel: C.CAMERA_MODELS[0],
  cameraLens: C.CAMERA_LENSES[0],
  phoneModel: C.PHONE_MODELS[0],
  photographyType: 'Model Photography',
  modelType: C.MODEL_TYPES[0],
  ageGeneration: C.AGE_GENERATIONS[0],
  hairDetail: C.HAIR_TEXTURE_OPTIONS[0],
  skinDetail: C.SKIN_TEXTURE_OPTIONS[0],
  environmentType: C.ENVIRONMENT_TYPES[0],
  lightingType: C.LIGHTING_TYPES[0],
  timeOfDay: C.TIME_OF_DAY[0],
  colorGrading: C.COLOR_GRADINGS[0],
  realismLevel: C.REALISM_LEVELS[0],
  presentationType: C.PRESENTATION_TYPES[0],
  moodType: C.MOOD_TYPES[0],
  textOnImage: false,
  pose: C.POSE_TYPES[0],
  modelExpression: C.MODEL_EXPRESSIONS[0],
  vibe: '',
  aspectRatio: C.ASPECT_RATIOS[0],
  aestheticStyle: C.AESTHETIC_STYLES[0],
  photographicEffect: C.PHOTOGRAPHIC_EFFECTS[0],
};

function formReducer(state: GeneratorFormState, action: { type: string; payload: any }): GeneratorFormState {
  return { ...state, [action.type]: action.payload };
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

const CaptionDisplay: React.FC<{captions: Captions | null}> = ({ captions }) => {
    if (!captions) return <div className="min-h-[100px]"></div>;
    const renderCaption = (title: string, data?: {caption: string, hashtags: string[]}) => {
        if(!data) return null;
        return (
            <div className="mb-4">
                <h4 className="font-semibold text-purple-400">{title}</h4>
                <p className="text-sm text-gray-300">{data.caption}</p>
                <p className="text-xs text-cyan-400 mt-1">{data.hashtags.join(' ')}</p>
            </div>
        )
    }
    return (
        <div className="mt-4 p-4 rounded-lg bg-gray-800 border border-gray-700">
            <h3 className="text-lg font-bold mb-2 flex items-center"><SparklesIcon className="mr-2"/> Generated Captions</h3>
            {renderCaption("English", captions.english)}
            {renderCaption("Hinglish", captions.hinglish)}
            {renderCaption("Hindi", captions.hindi)}
            {renderCaption("Seductive", captions.seductive)}
        </div>
    )
}

const FullscreenView: React.FC<{
  src: string;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}> = ({ src, onClose, onNext, onPrevious }) => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-300 z-20" aria-label="Close fullscreen view">
            <CloseIcon className="w-8 h-8" />
        </button>
        
        {onPrevious && (
            <button onClick={(e) => { e.stopPropagation(); onPrevious(); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 rounded-full text-white hover:bg-white/40 z-20 transition-transform transform hover:scale-110" aria-label="Previous image">
                <ArrowLeftIcon className="w-8 h-8" />
            </button>
        )}
        
        <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
             <img src={src} alt="Fullscreen view" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
        </div>

        {onNext && (
            <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 rounded-full text-white hover:bg-white/40 z-20 transition-transform transform hover:scale-110" aria-label="Next image">
                <ArrowRightIcon className="w-8 h-8" />
            </button>
        )}
    </div>
);

export const ImageGenerator: React.FC<{projectName: string}> = ({projectName}) => {
  const [state, dispatch] = useReducer(formReducer, {...initialState, projectName});
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [modelPhoto, setModelPhoto] = useState<UploadedFile | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [captions, setCaptions] = useState<Captions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lastGeneratedPrompt, setLastGeneratedPrompt] = useState<string | null>(null);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState<number | null>(null);
  const [lensOptions, setLensOptions] = useState<string[]>(C.CAMERA_LENSES);
  const [mockupLoadingId, setMockupLoadingId] = useState<string | null>(null);


  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    dispatch({ type: e.target.name, payload: e.target.value });
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
        const files = Array.from(event.target.files);
        const uploadedFilesData: UploadedFile[] = await Promise.all(
            files.map(async (file: File) => ({
                name: file.name,
                type: file.type,
                base64: await fileToBase64(file),
            }))
        );
        setUploadedFiles(prev => [...prev, ...uploadedFilesData]);

        if (uploadedFilesData.length > 0 && !modelPhoto) {
            setIsAnalyzing(true);
            setError(null);
            try {
                const photoType = await analyzeImageType(uploadedFilesData[0]);
                dispatch({ type: 'photographyType', payload: photoType });
            } catch (err) {
                setError(err instanceof Error ? err.message : "Could not analyze image type.");
            } finally {
                setIsAnalyzing(false);
            }
        }
    }
  };
  
  const handleModelPhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        try {
            const base64 = await fileToBase64(file);
            setModelPhoto({
                name: file.name,
                type: file.type,
                base64,
            });
            dispatch({ type: 'photographyType', payload: 'Model Photography' });
        } catch (error) {
            setError("Failed to load model photo.");
        }
    }
  };

  useEffect(() => {
    const selectedModel = state.cameraModel;
    if (C.LENSES_BY_CAMERA[selectedModel]) {
        const compatibleLenses = C.LENSES_BY_CAMERA[selectedModel];
        const newOptions = [C.CAMERA_LENSES[0], C.CAMERA_LENSES[1], ...compatibleLenses];
        setLensOptions(newOptions);
    } else {
        setLensOptions(C.CAMERA_LENSES);
    }
  }, [state.cameraModel]);


  const handleImageGeneration = useCallback(async () => {
    if (!state.description && uploadedFiles.length === 0 && !modelPhoto) {
      setError("Please provide a description or upload a file.");
      return;
    }
    setError(null);
    setIsLoading(true);
    setLoadingMessage("Generating stunning visuals...");
    setCaptions(null);
    setLastGeneratedPrompt(null);
    setGeneratedImages([]);

    try {
      const { imageUrls, prompt } = await generateImages(state, uploadedFiles, modelPhoto);
      const newImages = imageUrls.map((url, i) => ({ 
        id: `img-${Date.now()}-${i}`, 
        src: url, 
        prompt: prompt,
        photographyType: state.photographyType,
      }));
      setGeneratedImages(newImages);
      setLastGeneratedPrompt(prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [state, uploadedFiles, modelPhoto]);

  const handleCaptionGeneration = useCallback(async () => {
      if (!lastGeneratedPrompt) {
          setError("Generate an image first to create captions for it.");
          return;
      }
      setError(null);
      setIsLoading(true);
      setLoadingMessage("Generating witty captions...");
      try {
          const newCaptions = await generateCaptions(lastGeneratedPrompt, state.moodType);
          setCaptions(newCaptions);
      } catch(err) {
          setError(err instanceof Error ? err.message : "Could not generate captions.");
      } finally {
          setIsLoading(false);
      }
  }, [lastGeneratedPrompt, state.moodType]);

  const handleDownload = (src: string) => {
      const link = document.createElement('a');
      link.href = src;
      link.download = `${state.projectName.replace(/\s+/g, '_')}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }

  const handleCreateMockup = useCallback(async (image: GeneratedImage) => {
    setMockupLoadingId(image.id);
    setError(null);

    try {
        const response = await fetch(image.src);
        const blob = await response.blob();
        
        const base64data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                if (reader.result) {
                    resolve((reader.result as string).split(',')[1]);
                } else {
                    reject(new Error("Failed to read blob as Base64."));
                }
            };
            reader.onerror = error => reject(error);
        });

        const file: UploadedFile = {
            name: `mockup_source_${image.id}.png`,
            type: blob.type || 'image/png',
            base64: base64data,
        };
        
        const newImageUrl = await generateBlankProductMockup(file);
        
        setGeneratedImages(prevImages => prevImages.map(img => 
            img.id === image.id ? { ...img, src: newImageUrl } : img
        ));

    } catch (err) {
        setError(err instanceof Error ? err.message : "Could not create mockup.");
    } finally {
        setMockupLoadingId(null);
    }
  }, []);

  const handleNextImage = useCallback(() => {
    setFullscreenImageIndex(prev => (prev === null ? 0 : (prev + 1) % generatedImages.length));
  }, [generatedImages.length]);

  const handlePreviousImage = useCallback(() => {
    setFullscreenImageIndex(prev => (prev === null ? 0 : (prev - 1 + generatedImages.length) % generatedImages.length));
  }, [generatedImages.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (fullscreenImageIndex === null) return;
      if (e.key === 'ArrowRight') handleNextImage();
      else if (e.key === 'ArrowLeft') handlePreviousImage();
      else if (e.key === 'Escape') setFullscreenImageIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenImageIndex, handleNextImage, handlePreviousImage]);

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl">
      {isLoading && <Loader message={loadingMessage} />}
      {fullscreenImageIndex !== null && (
        <FullscreenView 
            src={generatedImages[fullscreenImageIndex].src} 
            onClose={() => setFullscreenImageIndex(null)}
            onNext={generatedImages.length > 1 ? handleNextImage : undefined}
            onPrevious={generatedImages.length > 1 ? handlePreviousImage : undefined}
        />
      )}

      <div className="space-y-8">
        <textarea name="description" value={state.description} onChange={handleInputChange} placeholder="Detailed Image Description (or upload PDF)" rows={3} className="w-full bg-[#2D2D2D] p-3 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A755F7]"/>

        <Card className="bg-[#2D2D2D]">
            <h3 className="text-lg font-semibold mb-2 text-center">Upload Your Model's Photo</h3>
            <p className="text-gray-400 text-sm mb-4 text-center">Use a clear, front-facing photo to get the best results.</p>
            {modelPhoto ? (
                <div className="text-center">
                    <div className="relative inline-block">
                        <img 
                            src={`data:${modelPhoto.type};base64,${modelPhoto.base64}`}
                            alt={modelPhoto.name}
                            className="w-32 h-32 object-cover rounded-full border-2 border-purple-400"
                        />
                        <button 
                            onClick={() => setModelPhoto(null)} 
                            className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1 text-white hover:bg-red-600 transition"
                            aria-label="Remove model photo"
                        >
                            <CloseIcon className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 truncate">{modelPhoto.name}</p>
                </div>
            ) : (
                <>
                    <label htmlFor="model-photo-upload" className="cursor-pointer">
                        <div className="text-center py-6 border-2 border-dashed border-gray-600 rounded-lg hover:border-purple-400 transition">
                            <UploadIcon className="mx-auto w-8 h-8 text-gray-500" />
                            <p className="text-gray-400 text-sm mt-2">Click to upload a single photo</p>
                        </div>
                    </label>
                    <input type="file" accept="image/*" onChange={handleModelPhotoChange} className="hidden" id="model-photo-upload" />
                </>
            )}
        </Card>

        <Card className="bg-[#2D2D2D]">
            <label htmlFor="file-upload" className="cursor-pointer">
                <div className="text-center py-10">
                    <Button onClick={() => document.getElementById('file-upload')?.click()} type="button">Browse Files</Button>
                    <p className="text-gray-400 text-sm mt-2">Upload reference images for style, clothing, or background.</p>
                </div>
            </label>
            <input type="file" multiple onChange={handleFileChange} className="hidden" id="file-upload" />
             {uploadedFiles.length > 0 && (
                <div className="pt-4 mt-4 border-t border-gray-700">
                    <h3 className="font-semibold mb-2 text-center">Reference Image Previews:</h3>
                    <div className="flex justify-center gap-2 flex-wrap">
                    {uploadedFiles.map((file, index) => (
                        <div key={`${file.name}-${index}`} className="relative group">
                            <img 
                                src={`data:${file.type};base64,${file.base64}`}
                                alt={file.name}
                                className="w-24 h-24 object-cover rounded-md border border-gray-600"
                            />
                        </div>
                    ))}
                    </div>
                     <div className="text-center mt-4">
                        <Button variant="outline" className="text-xs py-1 px-3 border-red-500 text-red-500 hover:bg-red-500 hover:text-white" onClick={() => setUploadedFiles([])}>Clear References</Button>
                    </div>
                </div>
            )}
        </Card>

        <Card className="bg-[#2D2D2D]">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Select label="Camera Angle" name="cameraAngle" value={state.cameraAngle} onChange={handleInputChange} options={C.CAMERA_ANGLES} />
              <Select label="Shooting Device" name="shootingDevice" value={state.shootingDevice} onChange={handleInputChange} options={C.SHOOTING_DEVICES} />
              {state.shootingDevice === 'Professional Camera' && (
                  <>
                      <Select label="Camera Model" name="cameraModel" value={state.cameraModel} onChange={handleInputChange} options={C.CAMERA_MODELS} />
                      <Select label="Lens Type" name="cameraLens" value={state.cameraLens} onChange={handleInputChange} options={lensOptions} />
                  </>
              )}
              {state.shootingDevice === 'Smartphone' && (
                  <Select label="Phone Model" name="phoneModel" value={state.phoneModel} onChange={handleInputChange} options={C.PHONE_MODELS} />
              )}
              <Select label="Realism Level" name="realismLevel" value={state.realismLevel} onChange={handleInputChange} options={C.REALISM_LEVELS} />
              <Select label="Aspect Ratio" name="aspectRatio" value={state.aspectRatio} onChange={handleInputChange} options={C.ASPECT_RATIOS} />
              <Select label="Environment" name="environmentType" value={state.environmentType} onChange={handleInputChange} options={C.ENVIRONMENT_TYPES} />
              <Select label="Lighting" name="lightingType" value={state.lightingType} onChange={handleInputChange} options={C.LIGHTING_TYPES} />
              <Select label="Time of Day" name="timeOfDay" value={state.timeOfDay} onChange={handleInputChange} options={C.TIME_OF_DAY} />
              <Select label="Color Grading" name="colorGrading" value={state.colorGrading} onChange={handleInputChange} options={C.COLOR_GRADINGS} />
              <Select label="Presentation" name="presentationType" value={state.presentationType} onChange={handleInputChange} options={C.PRESENTATION_TYPES} />
              <Select label="Mood" name="moodType" value={state.moodType} onChange={handleInputChange} options={C.MOOD_TYPES} />
               <Select label="Aesthetic Style" name="aestheticStyle" value={state.aestheticStyle} onChange={handleInputChange} options={C.AESTHETIC_STYLES} />
                <Select label="Photographic Effect" name="photographicEffect" value={state.photographicEffect} onChange={handleInputChange} options={C.PHOTOGRAPHIC_EFFECTS} />

              <div className="relative">
                <Select 
                    label="Photography Type" 
                    name="photographyType" 
                    value={state.photographyType} 
                    onChange={handleInputChange} 
                    options={['Model Photography', 'Product Photography']}
                    disabled={isAnalyzing || !!modelPhoto}
                />
                {isAnalyzing && (
                    <div className="absolute top-8 right-2 flex items-center space-x-1 pointer-events-none">
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs text-gray-400">Analyzing...</span>
                    </div>
                )}
              </div>

              {state.photographyType === 'Model Photography' && <>
                  <Select label="Model Type" name="modelType" value={state.modelType} onChange={handleInputChange} options={C.MODEL_TYPES} />
                  <Select label="Age/Generation" name="ageGeneration" value={state.ageGeneration} onChange={handleInputChange} options={C.AGE_GENERATIONS} />
                  <Select label="Pose" name="pose" value={state.pose} onChange={handleInputChange} options={C.POSE_TYPES} />
                  <Select label="Model Expression" name="modelExpression" value={state.modelExpression} onChange={handleInputChange} options={C.MODEL_EXPRESSIONS} />
                  <Select label="Hair Texture" name="hairDetail" value={state.hairDetail} onChange={handleInputChange} options={C.HAIR_TEXTURE_OPTIONS} />
                  <Select label="Skin Texture" name="skinDetail" value={state.skinDetail} onChange={handleInputChange} options={C.SKIN_TEXTURE_OPTIONS} />
              </>}
          </div>
        </Card>
        
        <div className="text-center">
            <Button onClick={handleImageGeneration} disabled={isLoading} className="w-full max-w-xs">
                {isLoading && !loadingMessage.includes('captions') ? 'Generating...' : 'Generate Images'}
            </Button>
            {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
        </div>

        <Card className="bg-[#2D2D2D]">
            <h3 className="text-center font-semibold mb-4">Generated Images</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {generatedImages.length > 0 ? generatedImages.map((image, index) => (
                    <div key={image.id} className="p-0 overflow-hidden group relative aspect-square rounded-xl">
                        <img src={image.src} alt={image.prompt} className="w-full h-full object-cover"/>
                        
                        {mockupLoadingId === image.id && (
                            <div className="absolute inset-0 bg-gray-900 bg-opacity-70 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                                <div className="w-8 h-8 border-2 border-[#a0eec0] border-t-transparent rounded-full animate-spin"></div>
                                <p className="mt-2 text-xs font-semibold text-gray-200">Creating Mockup...</p>
                            </div>
                        )}

                        <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                            <button onClick={() => setFullscreenImageIndex(index)} className="p-2 bg-white/20 rounded-full text-white hover:bg-white/40"><FullscreenIcon /></button>
                            <button onClick={() => handleDownload(image.src)} className="p-2 bg-white/20 rounded-full text-white hover:bg-white/40"><DownloadIcon /></button>
                            {image.photographyType === 'Product Photography' && (
                                <button 
                                    onClick={() => handleCreateMockup(image)} 
                                    className="p-2 bg-white/20 rounded-full text-white hover:bg-white/40 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!!mockupLoadingId}
                                    title="Create clean product mockup"
                                >
                                    <CubeIcon />
                                </button>
                            )}
                        </div>
                    </div>
                )) : Array.from({length: 3}).map((_, i) => (
                    <div key={i} className="bg-gray-700/50 rounded-xl aspect-square"></div>
                ))}
            </div>
             {generatedImages.length > 0 && (
                 <div className="flex justify-center p-4 mt-4">
                    <Button onClick={handleImageGeneration} variant="secondary" className="bg-purple-500 hover:bg-purple-600" disabled={isLoading}>
                      <RefreshIcon className="mr-2 inline"/>
                      {isLoading && !loadingMessage.includes('captions') ? 'Regenerating...' : 'Regenerate Images'}
                    </Button>
                 </div>
            )}
        </Card>

        <div className="text-center">
            <Button onClick={handleCaptionGeneration} disabled={isLoading || generatedImages.length === 0} className="w-full max-w-xs">
                 {isLoading && loadingMessage.includes('captions') ? 'Generating...' : (captions ? 'Regenerate Captions' : 'Generate Captions')}
            </Button>
        </div>

        <Card className="bg-[#2D2D2D]">
            <CaptionDisplay captions={captions} />
        </Card>

      </div>
    </div>
  );
};