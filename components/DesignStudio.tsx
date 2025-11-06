import React, { useState, ChangeEvent } from 'react';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Loader } from './common/Loader';
import { DESIGN_TRENDS, ASPECT_RATIOS } from '../constants';
import { generateDesignAsset, generateMockup, generateMixedImage } from '../services/geminiService';
import type { UploadedFile } from '../types';
import { UploadIcon, DownloadIcon } from './common/Icons';
import { Select } from './common/Select';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

const handleDownload = (src: string, filename: string) => {
  const link = document.createElement('a');
  link.href = src;
  link.download = `${filename.replace(/\s+/g, '_')}_${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const ImageMixerModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<string>(ASPECT_RATIOS[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            setIsLoading(true);
            try {
                const newFiles: UploadedFile[] = await Promise.all(
                    files.map(async (file: File) => ({
                        name: file.name,
                        type: file.type,
                        base64: await fileToBase64(file),
                    }))
                );
                setUploadedFiles(prev => [...prev, ...newFiles]);
                setResult(null);
            } catch (err) {
                setError("Error processing files.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleGenerate = async () => {
        if (uploadedFiles.length < 2) {
            setError('Please upload at least two images to mix.');
            return;
        }
        if (!prompt) {
            setError('Please provide instructions on how to mix the images.');
            return;
        }
        setError(null);
        setIsLoading(true);
        setResult(null);
        try {
            const imageUrl = await generateMixedImage(uploadedFiles, prompt, aspectRatio);
            setResult(imageUrl);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate mixed image.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-3xl relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                {isLoading && <Loader message="Mixing images with Nano Tech..." />}
                <h2 className="text-2xl font-bold mb-2" style={{color: '#a0eec0'}}>Image Mixer (Nano Tech)</h2>
                <p className="text-gray-400 mb-6">Blend multiple images with a prompt to create unique visual compositions.</p>
                
                <div className="mb-6">
                     <label htmlFor="mixer-file-upload" className="w-full min-h-[12rem] flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-[#23b5d3] transition-colors cursor-pointer bg-gray-900">
                        {uploadedFiles.length > 0 ? (
                            <div className="flex flex-wrap gap-4 justify-center">
                                {uploadedFiles.map((file, index) => (
                                     <img key={`${file.name}-${index}`} src={`data:${file.type};base64,${file.base64}`} alt="Preview" className="h-24 w-24 object-cover rounded-md" />
                                ))}
                            </div>
                        ) : (
                            <>
                                <UploadIcon className="w-12 h-12 text-gray-500 mb-2" />
                                <p className="text-gray-400 text-center text-sm">Click to upload at least 2 images</p>
                            </>
                        )}
                    </label>
                    <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" id="mixer-file-upload" />
                    {uploadedFiles.length > 0 && <div className="text-center mt-2">
                        <Button variant="outline" className="text-xs py-1 px-3 border-red-500 text-red-500 hover:bg-red-500 hover:text-white" onClick={() => setUploadedFiles([])}>Clear Images</Button>
                    </div>}
                </div>

                <textarea 
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder={`Describe how to mix the images... (e.g., 'Place the person from image 1 into the landscape of image 2')`}
                    className="w-full bg-gray-700 p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#a882dd] mb-4"
                    rows={2}
                />

                <div className="mb-6">
                    <Select 
                        label="Aspect Ratio"
                        value={aspectRatio}
                        onChange={e => setAspectRatio(e.target.value)}
                        options={ASPECT_RATIOS}
                    />
                </div>

                {error && <p className="text-red-400 my-4 text-center">{error}</p>}
                
                <div className="mt-6 flex justify-between items-center">
                    <Button onClick={onClose} variant="outline">Close</Button>
                    <Button onClick={handleGenerate} disabled={isLoading || uploadedFiles.length < 2 || !prompt}>
                        {isLoading ? 'Generating...' : 'Mix Images'}
                    </Button>
                </div>

                {result && (
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold">Result:</h3>
                            <Button onClick={() => handleDownload(result, 'Image-Mix')} variant="secondary" className="flex items-center px-4 py-2 text-sm">
                                <DownloadIcon className="w-5 h-5 mr-2" />
                                Download
                            </Button>
                        </div>
                        <img src={result} alt="Generated mixed image" className="w-full rounded-lg border border-gray-600" />
                    </div>
                )}
            </div>
        </div>
    );
};

const MockupToolModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
    const [aspectRatio, setAspectRatio] = useState<string>(ASPECT_RATIOS[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const base64 = await fileToBase64(file);
            setUploadedFile({
                name: file.name,
                type: file.type,
                base64: base64,
            });
            setResult(null); 
        }
    };

    const handleGenerate = async () => {
        if (!uploadedFile) {
            setError('Please upload an image.');
            return;
        }
        setError(null);
        setIsLoading(true);
        setResult(null);
        try {
            const imageUrl = await generateMockup(uploadedFile, aspectRatio);
            setResult(imageUrl);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate 3D render.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-xl relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                {isLoading && <Loader message="Generating 3D Render..." />}
                <h2 className="text-2xl font-bold mb-2" style={{color: '#a0eec0'}}>3D Mockup Generator</h2>
                <p className="text-gray-400 mb-6">Upload an image to convert it into a stunning 3D render.</p>
                
                <div className="w-full mb-6">
                    <h3 className="font-semibold text-lg mb-2 text-center">Upload Your Image</h3>
                     <label htmlFor="mockup-file-upload" className="w-full h-64 flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-[#23b5d3] transition-colors cursor-pointer bg-gray-900">
                        {uploadedFile ? (
                            <img src={`data:${uploadedFile.type};base64,${uploadedFile.base64}`} alt="Preview" className="max-h-full max-w-full object-contain rounded-md" />
                        ) : (
                            <>
                                <UploadIcon className="w-12 h-12 text-gray-500 mb-2" />
                                <p className="text-gray-400 text-center text-sm">Click to upload image</p>
                            </>
                        )}
                    </label>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="mockup-file-upload" />
                    {uploadedFile && <p className="text-xs text-gray-500 mt-1 text-center truncate">{uploadedFile.name}</p>}
                </div>

                <div className="mb-6">
                    <Select 
                        label="Aspect Ratio"
                        value={aspectRatio}
                        onChange={e => setAspectRatio(e.target.value)}
                        options={ASPECT_RATIOS}
                    />
                </div>


                {error && <p className="text-red-400 my-4 text-center">{error}</p>}
                
                <div className="mt-6 flex justify-between items-center">
                    <Button onClick={onClose} variant="outline">Close</Button>
                    <Button onClick={handleGenerate} disabled={isLoading || !uploadedFile}>
                        {isLoading ? 'Generating...' : 'Generate 3D Render'}
                    </Button>
                </div>

                {result && (
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold">Result:</h3>
                            <Button onClick={() => handleDownload(result, '3D-Render')} variant="secondary" className="flex items-center px-4 py-2 text-sm">
                                <DownloadIcon className="w-5 h-5 mr-2" />
                                Download
                            </Button>
                        </div>
                        <img src={result} alt="Generated mockup" className="w-full rounded-lg border border-gray-600" />
                    </div>
                )}
            </div>
        </div>
    );
};


const tools = [
  { name: 'Image Mixer (Nano Tech)', description: 'Blend multiple images with a prompt to create unique visual compositions.', type: 'mixer' as const },
  { name: '3D Mockup', description: 'Convert your uploaded image into a stunning 3D render.', type: 'mockup' as const },
  { name: 'Logo Generation', description: 'Create a unique logo for your brand.', type: 'generate' as const, promptPrefix: 'A minimalist vector logo for ' },
  { name: 'Packaging Design', description: 'Visualize product packaging concepts.', type: 'generate' as const, promptPrefix: 'A modern product packaging design for ' },
  { name: 'Vector Art', description: 'Generate custom vector-style illustrations.', type: 'generate' as const, promptPrefix: 'Clean vector art illustration of ' },
  { name: 'Digital Painting', description: 'Create beautiful, artistic digital paintings.', type: 'generate' as const, promptPrefix: 'A beautiful digital painting of ' },
  { name: '3D Model Render', description: 'Produce realistic 3D model renders from a description or reference image.', type: 'generate' as const, promptPrefix: 'A photorealistic 3D render of ', allowUpload: true },
  { name: 'Ad Creative', description: 'Design compelling visuals for ad campaigns.', type: 'generate' as const, promptPrefix: 'An eye-catching ad creative for ' },
];

const DesignToolModal: React.FC<{ tool: Extract<typeof tools[number], { type: 'generate' }>; onClose: () => void }> = ({ tool, onClose }) => {
    const [prompt, setPrompt] = useState('');
    const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const base64 = await fileToBase64(file);
            setUploadedFile({
                name: file.name,
                type: file.type,
                base64: base64,
            });
            setResult(null);
        }
    };

    const handleGenerate = async () => {
        if(!prompt) {
            setError('Please enter a description.');
            return;
        }
        setError(null);
        setIsLoading(true);
        setResult(null);
        try {
            const fullPrompt = `${tool.promptPrefix} ${prompt}`;
            const imageUrl = await generateDesignAsset(fullPrompt, uploadedFile);
            setResult(imageUrl);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate asset.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                {isLoading && <Loader message={`Generating ${tool.name}...`} />}
                <h2 className="text-2xl font-bold mb-2" style={{color: '#a0eec0'}}>{tool.name}</h2>
                <p className="text-gray-400 mb-6">{tool.description}</p>
                
                {tool.allowUpload && (
                    <div className="mb-6">
                        <h3 className="font-semibold text-lg mb-2 text-center">Upload Reference Image (Optional)</h3>
                        <label htmlFor="design-tool-file-upload" className="w-full h-48 flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-[#23b5d3] transition-colors cursor-pointer bg-gray-900">
                            {uploadedFile ? (
                                <img src={`data:${uploadedFile.type};base64,${uploadedFile.base64}`} alt="Preview" className="max-h-full max-w-full object-contain rounded-md" />
                            ) : (
                                <>
                                    <UploadIcon className="w-12 h-12 text-gray-500 mb-2" />
                                    <p className="text-gray-400 text-center text-sm">Click to upload image</p>
                                </>
                            )}
                        </label>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="design-tool-file-upload" />
                        {uploadedFile && <p className="text-xs text-gray-500 mt-1 text-center truncate">{uploadedFile.name}</p>}
                    </div>
                )}

                <textarea 
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder={`Describe what you want to create... (e.g., 'a coffee brand named "Aura"')`}
                    className="w-full bg-gray-700 p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#a882dd] mb-4"
                    rows={tool.allowUpload ? 2 : 4}
                />
                
                {error && <p className="text-red-400 mb-4">{error}</p>}
                
                <div className="flex justify-between items-center">
                    <Button onClick={onClose} variant="outline">Close</Button>
                    <Button onClick={handleGenerate} disabled={isLoading}>Generate</Button>
                </div>

                {result && (
                    <div className="mt-6">
                         <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold">Result:</h3>
                            <Button onClick={() => handleDownload(result, tool.name)} variant="secondary" className="flex items-center px-4 py-2 text-sm">
                                <DownloadIcon className="w-5 h-5 mr-2" />
                                Download
                            </Button>
                        </div>
                        <img src={result} alt="Generated design asset" className="w-full rounded-lg border border-gray-600" />
                    </div>
                )}
            </div>
        </div>
    );
};

export const DesignStudio: React.FC = () => {
    const [activeToolName, setActiveToolName] = useState<string | null>(null);

    const activeTool = tools.find(t => t.name === activeToolName);

    const closeModal = () => {
        setActiveToolName(null);
    };

  return (
    <div className="container mx-auto p-8">
        {activeTool?.type === 'mockup' && <MockupToolModal onClose={closeModal} />}
        {activeTool?.type === 'generate' && <DesignToolModal tool={activeTool} onClose={closeModal} />}
        {activeTool?.type === 'mixer' && <ImageMixerModal onClose={closeModal} />}
        
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-2">Visual Design Studio</h1>
            <p className="text-lg text-gray-400">Your complete suite for professional graphic design.</p>
        </div>

        <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-center">Inspiration Corner: Current Design Trends</h2>
            <div className="flex flex-wrap justify-center gap-3">
                {DESIGN_TRENDS.map(trend => (
                    <span key={trend} className="px-4 py-2 rounded-full text-sm font-medium bg-gray-800 border border-gray-700" style={{color: '#ffc09f'}}>{trend}</span>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map(tool => (
                <Card key={tool.name} onClick={() => setActiveToolName(tool.name)} className="flex flex-col">
                    <h3 className="text-xl font-bold mb-2" style={{color: '#a0eec0'}}>{tool.name}</h3>
                    <p className="text-gray-400 flex-grow">{tool.description}</p>
                    <div className="mt-4 text-right">
                        <span className="text-sm font-semibold" style={{color: '#a882dd'}}>Launch Tool &rarr;</span>
                    </div>
                </Card>
            ))}
        </div>
    </div>
  );
};