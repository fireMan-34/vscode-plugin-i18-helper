import { createHash } from 'crypto';
import { HASH_ALGORITHMS } from 'constants/index';

/**　MD5 获取 */
export const md5Hash = (password: string) => createHash(HASH_ALGORITHMS.MD5).update(password).digest('hex');

/** SHA256 获取 */
export const sha256Hash = (password: string) => createHash(HASH_ALGORITHMS.SHA256).update(password).digest('hex');