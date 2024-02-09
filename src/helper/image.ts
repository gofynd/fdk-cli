import fs from "fs-extra";
import imageSize from 'image-size';
import chalk from 'chalk';
import CommandError from '../lib/CommandError';

function calculateGCD(a, b) {
    return b === 0 ? a : calculateGCD(b, a % b);
}

export function validateImage(filePath: string, horizontalAspectRatio: number, verticalAspectRatio: number, minHeight: number, minWidth: number ){
  try{
    const dimensions = imageSize(fs.readFileSync(filePath));
    const width = dimensions.width;
    const height = dimensions.height;
    const aspectRatio = width / height;
    if(Math.abs(aspectRatio - (horizontalAspectRatio/verticalAspectRatio)) > 0.001){
        const gcd = calculateGCD(width, height);
        const aspectRatio = `${width/gcd}:${height/gcd}`;
        throw new CommandError(`Invalid image aspect ratio current aspect ratio is ${chalk.yellow(aspectRatio)} expected aspect ratio ${chalk.yellow(`${horizontalAspectRatio}:${verticalAspectRatio}`)} path ${chalk.yellow(filePath)}`);
    }
    if(width < minWidth){
       throw new CommandError(`Image width not adequate current width ${chalk.yellow(width)} minimum width required ${chalk.yellow(minWidth)} path ${chalk.yellow(filePath)}`);
    }
    if(height < minHeight){
        throw new CommandError(`Image height not adequate current height ${chalk.yellow(height)} minimum height required ${chalk.yellow(minHeight)} path ${chalk.yellow(filePath)}`);
    }
  }
  catch(err){
    throw err;
  }
}




