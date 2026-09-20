import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer('swangle');
// Deze sandbox (en de meeste CI-omgevingen) mogen remotion.media niet bereiken
// om een eigen Chrome te downloaden. Gebruik de Chromium die er al staat.
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}
