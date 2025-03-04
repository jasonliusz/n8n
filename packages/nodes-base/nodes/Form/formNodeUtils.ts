import { type Response } from 'express';
import {
	type NodeTypeAndVersion,
	type IWebhookFunctions,
	type FormFieldsParameter,
	type IWebhookResponseData,
} from 'n8n-workflow';

import { renderForm, sanitizeHtml } from './utils';

export const renderFormNode = async (
	context: IWebhookFunctions,
	res: Response,
	trigger: NodeTypeAndVersion,
	fields: FormFieldsParameter,
	mode: 'test' | 'production',
): Promise<IWebhookResponseData> => {
	const options = context.getNodeParameter('options', {}) as {
		formTitle: string;
		formDescription: string;
		buttonLabel: string;
		customCss?: string;
	};

	let title = options.formTitle;
	if (!title) {
		title = context.evaluateExpression(`{{ $('${trigger?.name}').params.formTitle }}`) as string;
	}

	let description = options.formDescription;
	if (!description) {
		description = context.evaluateExpression(
			`{{ $('${trigger?.name}').params.formDescription }}`,
		) as string;
	}

	let buttonLabel = options.buttonLabel;
	if (!buttonLabel) {
		buttonLabel =
			(context.evaluateExpression(
				`{{ $('${trigger?.name}').params.options?.buttonLabel }}`,
			) as string) || 'Submit';
	}

	for (const field of fields) {
		if (field.fieldType === 'html') {
			field.html = sanitizeHtml(field.html as string);
		}
	}

	const appendAttribution = context.evaluateExpression(
		`{{ $('${trigger?.name}').params.options?.appendAttribution === false ? false : true }}`,
	) as boolean;

	renderForm({
		context,
		res,
		formTitle: title,
		formDescription: description,
		formFields: fields,
		responseMode: 'responseNode',
		mode,
		redirectUrl: undefined,
		appendAttribution,
		buttonLabel,
		customCss: options.customCss,
	});

	return {
		noWebhookResponse: true,
	};
};
