// export default {
//   plugins: {
//     tailwindcss: {},
//     autoprefixer: {},
//   },
// }

import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import postcssImport from 'postcss-import';

export default {
  plugins: [
    postcssImport({
      filter: (path) => !path.includes('node_modules')
    }),
    tailwindcss(),
    autoprefixer()
  ]
}
