import { createHash } from 'crypto';
import { HASH_ALGORITHMS } from 'constants/index';

/**　MD5 获取 */
export const md5Hash = (password: string) => createHash(HASH_ALGORITHMS.MD5).update(password).digest('hex');