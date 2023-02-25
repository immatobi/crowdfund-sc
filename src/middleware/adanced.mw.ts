import { Model } from 'mongoose';
import { Request, Response, NextFunction } from 'express';

// this is important if you want to use req.advancedResults on the fly
declare global {
    namespace Express {
      interface Response {
        advancedResults?: any
      }
    }
}

const advancedResults = (model: Model<any>, populate: Array<any>) => async (req: Request<any>, res: Response, next: NextFunction ) => {

    let query: any;

    // copy request query
	const reqQuery = { ...req.query };

	// fields to exclude
	const removeFields = ['select', 'sort', 'page', 'limit'];

    // loop over removeFields and delete them from request query
	removeFields.forEach((p) => delete reqQuery[p]);

	// create query string
	let queryStr = JSON.stringify(reqQuery);

    // create operators
	queryStr = queryStr.replace(
		/\b(gt|gte|lt|lte|in)\b/g,
		(match) => `$${match}`
	);

    // find resource
	query = model.find(JSON.parse(queryStr));

    // select fields
	if (req.query.select) {
		const fields = (req.query.select as string).split(',').join(' ');
		query = query.select(fields);
	}

    // sort
	if (req.query.sort) {
		const sortBy = (req.query.sort as string).split(',').join(' ');
		query = query.select(sortBy);
	} else {
		query = query.sort('-createdAt');
	}

    // pagination
	const page = parseInt((req.query.page as string), 10) || 1;
	const limit = parseInt((req.query.limit as string), 10) || 50;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;
	const total = await model.countDocuments();

    query = query.skip(startIndex).limit(limit);

    //populate
	if (populate) {
		query = query.populate(populate);
	}

    // execute query
	const results: any = await query;

    // Pagination result
	const pagination: any = {};

    if (endIndex < total) {
		pagination.next = {
			page: page + 1,
			limit,
		};
	}

	if (startIndex > 0) {
		pagination.prev = {
			page: page - 1,
			limit,
		};
	}

    res.advancedResults = {
		error: false,
		errors: [],
		total: results.length,
		message: 'successfull',
		pagination: pagination,
		data: results,
		status: 200
	};

    // this part is important for express to move to next request
    next();

}

export default advancedResults;