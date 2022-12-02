import { writeLogEntry } from './utils';

export const TOKEN_EXPIRED_ERROR = 'TokenExpiredError';
export const fail = async (res, client, { message, email, form }) => {
  const error = message.toString();
  console.error(error);
  await writeLogEntry(
    client, 
    { error, email, form }
  );
  return res.json({ fatalError: true, message: error });
};
