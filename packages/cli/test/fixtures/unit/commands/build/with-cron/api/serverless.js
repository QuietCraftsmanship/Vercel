export default function (req, res) {
  res.json({ memory: parseInt(process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE) });
}

export const config = {
  cron: '* * * * *',
};
