import joi from 'joi';
export const categorvalidationySchema=joi.object({
name:joi.string ().required().min(2).max(50).message({
    'string.empty':"שם הקטגוריה הוא שדה חובה",
    'string.min':"שם הקטגרויה חייב להיות 2 תווים לפחות"
})
});