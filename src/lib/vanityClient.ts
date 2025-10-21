import axios from 'axios';

const baseURL = `${process.env.VANITY_API_URL}`;

const vanitiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default vanitiClient;