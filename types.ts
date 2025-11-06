
export interface GeneratorFormState {
  projectName: string;
  description: string;
  platformTarget: string;
  cameraAngle: string;
  shootingDevice: string;
  cameraModel: string;
  cameraLens: string;
  phoneModel: string;
  photographyType: string;
  modelType: string;
  ageGeneration: string;
  hairDetail: string;
  skinDetail: string;
  environmentType: string;
  lightingType: string;
  timeOfDay: string;
  colorGrading: string;
  realismLevel: string;
  presentationType: string;
  moodType: string;
  textOnImage: boolean;
  vibe: string;
  pose: string;
  modelExpression: string;
  aspectRatio: string;
  aestheticStyle: string;
  photographicEffect: string;
}

export interface UploadedFile {
  name: string;
  type: string;
  base64: string;
}

export interface GeneratedImage {
  id: string;
  src: string;
  prompt: string;
  photographyType: string;
}

export interface Captions {
  hinglish: { caption: string; hashtags: string[] };
  hindi: { caption:string; hashtags: string[] };
  english: { caption: string; hashtags: string[] };
  seductive?: { caption: string; hashtags: string[] };
}