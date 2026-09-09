// Xuất bề rộng vạch của một mã Code 128 ra JSON, để Playwright vẽ lại trong trình duyệt.
import { encodeCode128B } from '../shared/code128'
console.log(JSON.stringify(encodeCode128B(process.argv[2] ?? '9082228|3000|PCE|0008083')))
