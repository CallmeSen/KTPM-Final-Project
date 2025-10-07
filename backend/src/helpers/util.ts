import * as bcrypt from 'bcrypt';

export const hashPassword = async (Password: string) => {
    try {
        const saltOrRounds = 10;
    return await bcrypt.hash(Password, saltOrRounds);
  } catch (error) {
    console.log(error);
    }
};

export const comparePassword = async (
  Password: string,
  hassPassword: string,
) => {
    try {
        const isMatch = await bcrypt.compare(Password, hassPassword);

        return isMatch;
    }
    catch (error) {
        console.log(error)
    }
}