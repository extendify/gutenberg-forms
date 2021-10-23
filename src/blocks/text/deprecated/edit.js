/**
 *
 * ! DEPRECATED EDIT VERSION
 *
 */

import React, { useEffect } from "react";
import {
	FormToggle,
	Toolbar,
	PanelRow,
	PanelBody,
	TextControl,
	RangeControl,
	Icon,
} from "@wordpress/components";
import {
	getFieldName,
	extract_id,
	getEncodedData,
	extract_admin_id,
	get_admin_id,
} from "../../../block/misc/helper";
import { set, clone, assign } from "lodash";
import {
	getRootMessages,
	detect_similar_forms,
} from "../../../block/functions/index";
import ConditionalLogic from "../../../block/components/condition";

const {
	InspectorControls,
	BlockControls,
	BlockIcon,
	RichText,
} = wp.blockEditor;
const { __ } = wp.i18n;

function edit(props) {
	const handleChange = (e) => {
		let text = e.target.value;

		props.setAttributes({ text });
	};

	const handleRequired = () => {
		const { isRequired } = props.attributes;

		props.setAttributes({ isRequired: !isRequired });
	};

	const handleLabel = (label) => {
		props.setAttributes({ label });
	};

	const {
		text,
		isRequired,
		label,
		id,
		field_name,
		requiredLabel,
		messages,
		messages: { invalid, empty },
		pattern,
		minimumLength,
		maximumLength,
		condition,
		adminId,
		enableCondition,
	} = props.attributes;

	const getRootData = () => {
		if (field_name === "" || detect_similar_forms(props.clientId)) {
			const newFieldName = getFieldName("text", props.clientId);

			props.setAttributes({
				field_name: newFieldName,
				adminId: {
					value: extract_admin_id(newFieldName, "text"),
					default: extract_admin_id(newFieldName, "text"),
				},
			});
			props.setAttributes({
				id:
					props.clientId +
					"__" +
					getEncodedData(
						"text",
						props.clientId,
						isRequired,
						get_admin_id(adminId)
					),
			});
		} else if (field_name !== "") {
			props.setAttributes({
				id:
					extract_id(field_name) +
					"__" +
					getEncodedData(
						"text",
						extract_id(field_name),
						isRequired,
						get_admin_id(adminId)
					),
			});
		}
	};

	useEffect(() => {
		let rootMessages = getRootMessages(props.clientId, "text");

		if (rootMessages) {
			const newMessages = clone(messages);

			assign(newMessages, rootMessages);

			props.setAttributes({ messages: newMessages });
		}

		getRootData();
	}, []);

	useEffect(() => getRootData(), [props]);

	const setMessages = (type, m) => {
		let newMessages = clone(messages);

		set(newMessages, type, m);

		props.setAttributes({ messages: newMessages });
	};

	const handleAdminId = (id) => {
		props.setAttributes({
			adminId: {
				...adminId,
				value: id.replace(/\s|-/g, "_"),
			},
		});
	};

	return [
		!!props.isSelected && (
			<InspectorControls>
				<PanelBody title={__("Field Settings", "cwp-gutenberg-forms")} initialOpen={true}>
					<div className="cwp-option">
						<TextControl
							placeholder={adminId.default}
							label={__("Field ID", "cwp-gutenberg-forms")}
							value={adminId.value}
							onChange={handleAdminId}
						/>
					</div>

					{!enableCondition ? (
						<PanelRow>
							<h3 className="cwp-heading">{__("Required", "cwp-gutenberg-forms")}</h3>
							<FormToggle
								label={__("Required", "cwp-gutenberg-forms")}
								checked={isRequired}
								onChange={handleRequired}
							/>
						</PanelRow>
					) : (
						<div className="cwp-option">
							<p>
								<Icon icon="info" />{" "}
								{__(
									"You cannot set a conditional field required!",
									"cwp-gutenberg-forms"
								)}
							</p>
						</div>
					)}

					{isRequired && (
						<div className="cwp-option">
							<h3 className="cwp-heading">
								{__("Required Text", "cwp-gutenberg-forms")}
							</h3>
							<TextControl
								onChange={(label) =>
									props.setAttributes({ requiredLabel: label })
								}
								value={requiredLabel}
							/>
						</div>
					)}

					<div className="cwp-option">
						<RangeControl
							label={__("Minimum Length", "cwp-gutenberg-forms")}
							value={minimumLength}
							initialPosition={0}
							onChange={(value) =>
								props.setAttributes({ minimumLength: value })
							}
							min={0}
							max={100}
						/>
						<RangeControl
							label={__("Maximum Length", "cwp-gutenberg-forms")}
							value={maximumLength}
							onChange={(value) =>
								props.setAttributes({ maximumLength: value })
							}
							min={1}
							max={100}
						/>
					</div>
				</PanelBody>
				<PanelBody title={__("Condition", "cwp-gutenberg-forms")}>
					<ConditionalLogic
						condition={condition}
						set={props.setAttributes}
						clientId={props.clientId}
						useCondition={props.attributes.enableCondition}
					/>
				</PanelBody>
				<PanelBody title={__("Messages", "cwp-gutenberg-forms")}>
					{isRequired && (
						<div className="cwp-option">
							<h3 className="cwp-heading">
								{__("Required Error", "cwp-gutenberg-forms")}
							</h3>
							<TextControl
								onChange={(label) => setMessages("empty", label)}
								value={empty}
							/>
						</div>
					)}
					<div className="cwp-option">
						<h3 className="cwp-heading">
							{__("Invalid Message Error", "cwp-gutenberg-forms")}
						</h3>
						<TextControl
							onChange={(v) => setMessages("invalid", v)}
							value={invalid}
						/>
					</div>
					<div className="cwp-option">
						<p>
							<Icon icon="info" />{" "}
							{__("Use {{value}} to insert field value!", "cwp-gutenberg-forms")}
						</p>
					</div>
				</PanelBody>
				<PanelBody title={__("Validation", "cwp-gutenberg-forms")}>
					<div className="cwp-option">
						<TextControl
							label={__("Pattern (RegExp)", "cwp-gutenberg-forms")}
							onChange={(pattern) => props.setAttributes({ pattern })}
							value={pattern}
						/>
					</div>
				</PanelBody>
			</InspectorControls>
		),
		!!props.isSelected && <BlockControls></BlockControls>,
		<div className={`cwp-text cwp-field ${props.className}`}>
			{!!props.isSelected && !enableCondition && (
				<div className="cwp-required">
					<h3>Required</h3>
					<FormToggle checked={isRequired} onChange={handleRequired} />
				</div>
			)}

			<div className="cwp-field-set">
				<div className="cwp-label-wrap">
					<RichText
						placeholder={__("Add a label", "cwp-gutenberg-forms")}
						tag="label"
						value={label}
						onChange={handleLabel}
					/>
					{!props.isSelected && isRequired && !enableCondition && (
						<div className="cwp-required cwp-noticed">
							<h3>{requiredLabel}</h3>
						</div>
					)}
				</div>
				<input value={text} onChange={handleChange} />
			</div>
		</div>,
	];
}

export default edit;
