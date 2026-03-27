import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.simpleeditor.app',
  appName: '简单编辑',
  webDir: 'dist',
  android: {
    backgroundColor: '#F5FAFB',
  },
  plugins: {
    Filesystem: {
      // Uses Directory.Data by default
    },
  },
}

export default config
