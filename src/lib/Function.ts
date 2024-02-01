import inquirer from "inquirer";
import CommandError, { ErrorCodes } from "./CommandError";
import { FUNCTION_TYPE, convertToSlug, validateFunctionName } from "../helper/functions.utils";
import { validateEmpty } from "../helper/extension_utils";
import { CreateFunctionOptions, FunctionType } from "../helper/functions.types";

export default class FunctionCommands {

    public static async syncHandler() {
        try {

        } catch(error) {
            throw new CommandError(error.message, error.code);
        }
    }


    public static async createHandler(options: CreateFunctionOptions) {
        try {
            if (!options.name) {
                options.name = await FunctionCommands.promptFunctionName();
            }

            validateFunctionName(options.name);
            const slug = convertToSlug(options.name);

            console.log('slug: ', slug);
            

            if (!options.type) {
                options.type = await FunctionCommands.promptFunctionType();
            }

            if (!Object.values(FUNCTION_TYPE).includes(options.type)) {
                throw new CommandError(
                    ErrorCodes.INVALID_FUNCTION_TYPE.message,
                    ErrorCodes.INVALID_FUNCTION_TYPE.code
                )
            }

            console.log('type: ', options.type);

            

        } catch(error) {
            throw new CommandError(error.message, error.code);
        }
    }

    static async promptFunctionName(): Promise<string> {
        try {
            let answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'function_name',
                    message: 'Enter Function name:',
                    validate: validateEmpty
                }
            ]);
            return answers.function_name;
        } catch(error) {
            throw new CommandError(error.message);
        }
    }

    static async promptFunctionType(): Promise<FunctionType> {
        try {
            let answers = await inquirer.prompt([
                {
                    type: 'list',
                    choices: Object.values(FUNCTION_TYPE),
                    default: FUNCTION_TYPE.IN_HOOK,
                    name: 'function_type',
                    message: 'Select Function type:',
                    validate: validateEmpty
                }
            ])
            return answers.function_type
        }
    }

}