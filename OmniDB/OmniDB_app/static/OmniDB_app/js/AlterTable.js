/*
Copyright 2015-2017 The OmniDB Team

This file is part of OmniDB.

OmniDB is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

OmniDB is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with OmniDB. If not, see http://www.gnu.org/licenses/.
*/

/// <summary>
/// Initiates alter table window.
/// </summary>
/// <param name="p_mode">Alter or new table.</param>
/// <param name="p_table">Table name.</param>
/// <param name="p_schema">Schema name.</param>
function startAlterTable(p_mode, p_table, p_schema) {

	var v_curr_tab_tag = v_connTabControl.selectedTab.tag.tabControl.selectedTab.tag;
	v_curr_tab_tag.tabControl.selectTabIndex(0);

	v_curr_tab_tag.txtTableName.value = p_table;
	//document.getElementById('txt_tableNameAlterTable').style.backgroundColor = 'white';

	var input = JSON.stringify({"p_database_index": v_connTabControl.selectedTab.tag.selectedDatabaseIndex, "p_table": p_table, "p_schema": p_schema});

	execAjax('/alter_table_data/',
				input,
				function(p_return) {

					if (!p_return.v_data.v_can_add_constraint && p_mode=='alter')
						$(v_curr_tab_tag.btNewConstraint).hide();
					else
						$(v_curr_tab_tag.btNewConstraint).show();

					if (!p_return.v_data.v_can_rename_table && p_mode=='alter') {
						$(v_curr_tab_tag.txtTableName).prop("readonly", true);
						v_curr_tab_tag.txtTableName.style.backgroundColor = 'rgb(242, 242, 242)';

					}
					else {
						$(v_curr_tab_tag.txtTableName).prop("readonly", false);
						$(v_curr_tab_tag.txtTableName).removeClass("txt_readonly");
					}

					/*$('#div_alter_table').show();

					var v_height  = window.innerHeight - $('#div_alter_table_data').offset().top - 120;
					document.getElementById('div_alter_table_data').style.height = v_height + "px";
					document.getElementById('div_alter_constraint_data').style.height = v_height + "px";*/

					//Columns Table
					var v_div_result = v_curr_tab_tag.htDivColumns;

					var columnProperties = [];

					var col = new Object();
      				col.title =  'Column Name';
      				col.width = '100px';
     	 			columnProperties.push(col);

     	 			var col = new Object();
      				col.title =  'Data Type';
      				col.width = '160px';
      				col.type = 'autocomplete';
	                col.source = p_return.v_data.v_data_types;
     	 			columnProperties.push(col);

					var col = new Object();
	                col.title =  'Nullable';
	                col.width = '80px';
	                col.type = 'dropdown';
	                col.source = ['YES','NO'];
	                columnProperties.push(col);

	                var col = new Object();
      				col.title =  ' ';
      				col.renderer = 'html';
     	 			columnProperties.push(col);

	                var v_infoRowsColumns = [];

	                for (var i=0; i < p_return.v_data.v_data_columns.length; i++) {
	                	var v_object = new Object();
	                	v_object.mode = 0;
	                	v_object.old_mode = -1;
	                	v_object.index = i;
	                	v_object.originalColName = p_return.v_data.v_data_columns[i][0];
	                	v_object.originalDataType = p_return.v_data.v_data_columns[i][1];
	                	v_object.originalNullable = p_return.v_data.v_data_columns[i][2];
	                	v_infoRowsColumns.push(v_object);
	                }

					if (v_curr_tab_tag.htDivColumns.innerHTML!='') {

						v_curr_tab_tag.alterTableObject.htColumns.destroy();

					}

					if (v_curr_tab_tag.htDivConstraints.innerHTML!='') {

						v_curr_tab_tag.alterTableObject.htConstraints.destroy();

					}

					if (v_curr_tab_tag.htDivIndexes.innerHTML!='') {

						v_curr_tab_tag.alterTableObject.htIndexes.destroy();

					}

					var container = v_div_result;

					v_curr_tab_tag.alterTableObject = new Object();

					v_curr_tab_tag.alterTableObject.tableName = p_table;
                    v_curr_tab_tag.alterTableObject.schemaName = p_schema;
					v_curr_tab_tag.alterTableObject.infoRowsColumns = v_infoRowsColumns;
					v_curr_tab_tag.alterTableObject.cellChanges = [];
					v_curr_tab_tag.alterTableObject.mode = p_mode;
					v_curr_tab_tag.alterTableObject.window = 'columns';
					v_curr_tab_tag.alterTableObject.canAlterType = p_return.v_data.v_can_alter_type;
                	v_curr_tab_tag.alterTableObject.canAlterNullable = p_return.v_data.v_can_alter_nullable;
                	v_curr_tab_tag.alterTableObject.canRenameColumn = p_return.v_data.v_can_rename_column;
                	v_curr_tab_tag.alterTableObject.hasUpdateRule = p_return.v_data.v_has_update_rule;
					v_curr_tab_tag.alterTableObject.htConstraints = null;
					v_curr_tab_tag.alterTableObject.fkRefColumns = p_return.v_data.table_ref_columns;
					v_curr_tab_tag.alterTableObject.can_drop_column = p_return.v_data.v_can_drop_column;

					v_curr_tab_tag.alterTableObject.htColumns = new Handsontable(container,
					{
						data: p_return.v_data.v_data_columns,
						columns : columnProperties,
						colHeaders : true,
						rowHeaders : true,
						manualColumnResize: true,
						minSpareRows: 1,
						beforeChange: function (changes, source) {

	                        if (!changes) {
	                            return;
	                        }

	                        $.each(changes, function (index, element) {
	                            var change = element;
	                            var rowIndex = change[0];
	                            var columnIndex = change[1];
	                            var oldValue = change[2];
	                            var newValue = change[3];

	                            if (rowIndex >= v_curr_tab_tag.alterTableObject.infoRowsColumns.length)
	                            {
	                            	var v_object = new Object();
						        	v_object.mode = 2;
						        	v_object.old_mode = 2;
						        	v_object.originalColName = '';
						        	v_object.originalDataType = '';
						        	v_object.index = v_curr_tab_tag.alterTableObject.infoRowsColumns.length;
						        	v_object.nullable = '';

									v_curr_tab_tag.alterTableObject.infoRowsColumns.push(v_object);

									v_curr_tab_tag.btSave.style.visibility = 'visible';

	                            }

	                            if(oldValue != newValue && v_curr_tab_tag.alterTableObject.infoRowsColumns[rowIndex].mode!=2) {

	                            	if (v_curr_tab_tag.alterTableObject.infoRowsColumns[rowIndex].mode!=-1)
	                            		v_curr_tab_tag.alterTableObject.infoRowsColumns[rowIndex].mode = 1;
	                            	else
	                            		v_curr_tab_tag.alterTableObject.infoRowsColumns[rowIndex].old_mode = 1;

	                                v_curr_tab_tag.btSave.style.visibility = 'visible';

	                            }
	                        });

	                    },
	                    cells: function (row, col, prop) {

						    var cellProperties = {};

						    if (v_curr_tab_tag.alterTableObject.infoRowsColumns[row]!=null) {

						    	if (col==3) {
						    		if (v_curr_tab_tag.alterTableObject.can_drop_column || v_curr_tab_tag.alterTableObject.infoRowsColumns[row].mode==2)
						    			cellProperties.renderer = columnsActionRenderer;
						    		else
						    			cellProperties.renderer = grayEmptyRenderer;
	    							cellProperties.readOnly = true;
								}
								else if (v_curr_tab_tag.alterTableObject.infoRowsColumns[row].mode==2) {
	    							cellProperties.renderer = greenHtmlRenderer;
	    						}
	    						else if (v_curr_tab_tag.alterTableObject.infoRowsColumns[row].mode==-1) {
	    							cellProperties.renderer = redHtmlRenderer;
	    						}
	    						else if (v_curr_tab_tag.alterTableObject.infoRowsColumns[row].mode== 1) {
	    							cellProperties.renderer = yellowHtmlRenderer;
	    						}
	    						else if ((!v_curr_tab_tag.alterTableObject.canAlterType && col==1) || (!v_curr_tab_tag.alterTableObject.canAlterNullable && col==2) || (!v_curr_tab_tag.alterTableObject.canRenameColumn && col==0)) {
	    							cellProperties.renderer = grayHtmlRenderer;
	    							cellProperties.readOnly = true;
	    						}
	    						else {
	    							if (row % 2 == 0)
	    								cellProperties.renderer = blueHtmlRenderer;
	    							else
	    								cellProperties.renderer = whiteHtmlRenderer;
	    						}

    						}
    						else {
    							if (col==3) {
						    		cellProperties.renderer = grayEmptyRenderer;
	    							cellProperties.readOnly = true;
								}
    						}

						    return cellProperties;

						}
					});

					v_curr_tab_tag.tabControl.tabList[0].tag = { ht: v_curr_tab_tag.alterTableObject.htColumns };

					//Constraints Table
					var v_div_result = v_curr_tab_tag.htDivConstraints;

					var columnProperties = [];

					var col = new Object();
      				col.title =  'Constraint Name';
      				col.width = '100px';
     	 			columnProperties.push(col);

					var col = new Object();
	                col.title =  'Type';
	                col.width = '100px';
	                col.type = 'dropdown';
	                col.source = ['Primary Key','Foreign Key','Unique'];
	                columnProperties.push(col);

	                var col = new Object();
      				col.title =  'Columns';
      				col.width = '140px';
     	 			columnProperties.push(col);

     	 			var col = new Object();
	                col.title =  'Referenced Table';
	                col.width = '140px';
	                col.type = 'autocomplete';
	                col.source = p_return.v_data.v_tables;
	                columnProperties.push(col);

     	 			var col = new Object();
      				col.title =  'Referenced Columns';
      				col.width = '140px';
      				col.type = 'autocomplete';
     	 			columnProperties.push(col);

     	 			var col = new Object();
	                col.title =  'Delete Rule';
	                col.width = '100px';
	                col.type = 'autocomplete';
	                col.source = p_return.v_data.v_delete_rules;
	                columnProperties.push(col);

	                var col = new Object();
	                col.title =  'Update Rule';
	                col.width = '100px';
	                col.type = 'autocomplete';
	                col.source = p_return.v_data.v_update_rules;
	                columnProperties.push(col);

     	 			var col = new Object();
      				col.title =  ' ';
      				col.renderer = 'html';
     	 			columnProperties.push(col);

     	 			var v_infoRowsConstraints = [];

	                for (var i=0; i < p_return.v_data.v_data_constraints.length; i++) {
	                	var v_object = new Object();
	                	v_object.mode = 0;
	                	v_object.old_mode = -1;
	                	v_object.index = i;
	                	v_infoRowsConstraints.push(v_object);
	                }

	                v_curr_tab_tag.alterTableObject.infoRowsConstraints = v_infoRowsConstraints;
	                v_curr_tab_tag.alterTableObject.canAlterConstraints = false;


					var container = v_div_result;


					v_curr_tab_tag.alterTableObject.htConstraints = new Handsontable(container,
					{
						data: p_return.v_data.v_data_constraints,
						columns : columnProperties,
						colHeaders : true,
						manualColumnResize: true,
						beforeChange: function (changes, source) {

	                        if (!changes) {
	                            return;
	                        }
	                        $.each(changes, function (index, element) {
	                            var change = element;
	                            var rowIndex = change[0];
	                            var columnIndex = change[1];
	                            var oldValue = change[2];
	                            var newValue = change[3];

	                            if(oldValue != newValue){

	                            	if (columnIndex == 3) {
	                            		getReferenceColumnsList(rowIndex,newValue);
	                            	}

	                            	v_curr_tab_tag.btSave.style.visibility = 'visible';
	                            }
	                        });

	                    },
						cells: function (row, col, prop) {

						    var cellProperties = {};

						    if (v_curr_tab_tag.alterTableObject.infoRowsConstraints[row]!=null) {

					    		var v_constraint_type = p_return.v_data.v_data_constraints[row][1];

						    	if (col==7 || (!v_curr_tab_tag.alterTableObject.hasUpdateRule && col==6)) {
						    		cellProperties.renderer = grayHtmlRenderer;
	    							cellProperties.readOnly = true;
								}
								else if (v_curr_tab_tag.alterTableObject.infoRowsConstraints[row].mode==-1) {
	    							cellProperties.renderer = redHtmlRenderer;
	    						}
								else if ( (v_constraint_type!='Primary Key' && v_constraint_type!='Foreign Key' && v_constraint_type!='Unique') && (col==2) ) {
						    		cellProperties.renderer = grayHtmlRenderer;
	    							cellProperties.readOnly = true;
								}
								else if ( (v_constraint_type!='Foreign Key') && (col==3 || col==4 || col==5 || col==6) ) {
						    		cellProperties.renderer = grayHtmlRenderer;
	    							cellProperties.readOnly = true;
								}
								else if (v_curr_tab_tag.alterTableObject.infoRowsConstraints[row].mode==2) {
	    							cellProperties.renderer = greenHtmlRenderer;
	    							cellProperties.readOnly = false;
	    						}
	    						else if (!v_curr_tab_tag.alterTableObject.canAlterConstraints) {
	    							cellProperties.renderer = grayHtmlRenderer;
	    							cellProperties.readOnly = true;
	    						}
	    						else {
	    							if (row % 2 == 0)
	    								cellProperties.renderer = blueHtmlRenderer;
	    							else
	    								cellProperties.renderer = whiteHtmlRenderer;
	    						}

	    						if (col==2)
						    		cellProperties.readOnly = true;

	    						if (col==4) {
							    	if (p_return.v_data.v_data_constraints[row][1]=='Foreign Key') {

							    		cellProperties.type='dropdown';
							    		//cellProperties.source = v_curr_tab_tag.alterTableObject.fkRefColumns[row];

							    	}
						    	}

    						}

						    return cellProperties;

						}

					});

					v_curr_tab_tag.tabControl.tabList[1].tag = { ht: v_curr_tab_tag.alterTableObject.htConstraints };

					//Indexes Table
					var v_div_result = v_curr_tab_tag.htDivIndexes;

					var columnProperties = [];

					var col = new Object();
      				col.title =  'Index Name';
      				col.width = '100px';
     	 			columnProperties.push(col);

					var col = new Object();
	                col.title =  'Type';
	                col.width = '100px';
	                col.type = 'dropdown';
	                col.source = ['Non Unique','Unique'];
	                columnProperties.push(col);

	                var col = new Object();
      				col.title =  'Columns';
      				col.width = '160px';
     	 			columnProperties.push(col);

     	 			var col = new Object();
      				col.title =  ' ';
      				col.renderer = 'html';
     	 			columnProperties.push(col);

     	 			var v_infoRowsIndexes = [];

	                for (var i=0; i < p_return.v_data.v_data_indexes.length; i++) {
	                	var v_object = new Object();
	                	v_object.mode = 0;
	                	v_object.old_mode = -1;
	                	v_object.index = i;
	                	v_infoRowsIndexes.push(v_object);
	                }

	                v_curr_tab_tag.alterTableObject.infoRowsIndexes = v_infoRowsIndexes;
	                v_curr_tab_tag.alterTableObject.canAlterIndexes = false;


					var container = v_div_result;

					v_curr_tab_tag.alterTableObject.htIndexes = new Handsontable(container,
					{
						data: p_return.v_data.v_data_indexes,
						columns : columnProperties,
						colHeaders : true,
						manualColumnResize: true,
						beforeChange: function (changes, source) {

	                        if (!changes) {
	                            return;
	                        }
	                        $.each(changes, function (index, element) {
	                            var change = element;
	                            var rowIndex = change[0];
	                            var columnIndex = change[1];
	                            var oldValue = change[2];
	                            var newValue = change[3];

	                            if(oldValue != newValue){

	                            	if (columnIndex == 3) {
	                            		getReferenceColumnsList(rowIndex,newValue);
	                            	}

	                            	v_curr_tab_tag.btSave.style.visibility = 'visible';
	                            }
	                        });

	                    },
						cells: function (row, col, prop) {

						    var cellProperties = {};

						    if (v_curr_tab_tag.alterTableObject.infoRowsIndexes[row]!=null) {

						    	if (col==3) {
						    		cellProperties.renderer = grayHtmlRenderer;
	    							cellProperties.readOnly = true;
								}
								else if (v_curr_tab_tag.alterTableObject.infoRowsIndexes[row].mode==-1) {
	    							cellProperties.renderer = redHtmlRenderer;
	    						}
								else if (v_curr_tab_tag.alterTableObject.infoRowsIndexes[row].mode==2) {
	    							cellProperties.renderer = greenHtmlRenderer;
	    							cellProperties.readOnly = false;
	    						}
	    						else if (!v_curr_tab_tag.alterTableObject.canAlterIndexes) {
	    							cellProperties.renderer = grayHtmlRenderer;
	    							cellProperties.readOnly = true;
	    						}
	    						else {
	    							if (row % 2 == 0)
	    								cellProperties.renderer = blueHtmlRenderer;
	    							else
	    								cellProperties.renderer = whiteHtmlRenderer;
	    						}

	    						if (col==2)
						    		cellProperties.readOnly = true;


    						}

						    return cellProperties;
						}

					});

					v_curr_tab_tag.tabControl.tabList[2].tag = { ht: v_curr_tab_tag.alterTableObject.htIndexes };


				},
				null,
				'box');

}

/// <summary>
/// Retrieves list of pks and uniques referenced by FKs in specific table.
/// </summary>
/// <param name="p_row_index">Row number of current FK.</param>
/// <param name="p_table_name">Table name.</param>
function getReferenceColumnsList(p_row_index, p_table_name) {

	var v_currAlterTableObject = v_connTabControl.selectedTab.tag.tabControl.selectedTab.tag.alterTableObject;

	var input = JSON.stringify({"p_database_index": v_connTabControl.selectedTab.tag.selectedDatabaseIndex, "p_table_name": p_table_name});

	execAjax('MainDB.aspx/RefreshRefColumnsList',
				input,
				function(p_return) {

					v_currAlterTableObject.fkRefColumns[p_row_index] = p_return.v_data;
					v_currAlterTableObject.htConstraints.render();

				},
				null,
				'box');

}

/// <summary>
/// Saves alter table changes.
/// </summary>
function saveAlterTable() {

	var v_currTabTag = v_connTabControl.selectedTab.tag.tabControl.selectedTab.tag;

	var v_changedRowsColumnsInfo = [];
	var v_changedRowsColumnsData = [];

	var v_changedRowsConstraintsInfo = [];
	var v_changedRowsConstraintsData = [];

	var v_changedRowsIndexesInfo = [];
	var v_changedRowsIndexesData = [];

	for (var i=0; i < v_currTabTag.alterTableObject.infoRowsColumns.length; i++) {
		if (v_currTabTag.alterTableObject.infoRowsColumns[i].mode!=0) {
			v_currTabTag.alterTableObject.infoRowsColumns[i].index = i;
			v_changedRowsColumnsInfo.push(v_currTabTag.alterTableObject.infoRowsColumns[i]);
			v_changedRowsColumnsData.push(v_currTabTag.alterTableObject.htColumns.getDataAtRow(i));

		}
	}

	for (var i=0; i < v_currTabTag.alterTableObject.infoRowsConstraints.length; i++) {
		if (v_currTabTag.alterTableObject.infoRowsConstraints[i].mode!=0) {
			v_currTabTag.alterTableObject.infoRowsConstraints[i].index = i;
			v_changedRowsConstraintsInfo.push(v_currTabTag.alterTableObject.infoRowsConstraints[i]);
			var v_row = v_currTabTag.alterTableObject.htConstraints.getDataAtRow(i);

			v_row[2] = v_row[2].substring(114);

			v_changedRowsConstraintsData.push(v_row);
		}

	}

	for (var i=0; i < v_currTabTag.alterTableObject.infoRowsIndexes.length; i++) {
		if (v_currTabTag.alterTableObject.infoRowsIndexes[i].mode!=0) {
			v_currTabTag.alterTableObject.infoRowsIndexes[i].index = i;
			v_changedRowsIndexesInfo.push(v_currTabTag.alterTableObject.infoRowsIndexes[i]);
			var v_row = v_currTabTag.alterTableObject.htIndexes.getDataAtRow(i);

			v_row[2] = v_row[2].substring(110);

			v_changedRowsIndexesData.push(v_row);
		}

	}

	var v_new_table_name = v_currTabTag.txtTableName.value;
  var v_schema_name = v_currTabTag.alterTableObject.schemaName;

	var input = JSON.stringify({"p_database_index": v_connTabControl.selectedTab.tag.selectedDatabaseIndex, "p_mode" : v_currTabTag.alterTableObject.mode, "p_schema_name": v_currTabTag.alterTableObject.schemaName, "p_new_table_name": v_new_table_name, "p_original_table_name": v_currTabTag.alterTableObject.tableName, "p_data_columns": v_changedRowsColumnsData, "p_row_columns_info": v_changedRowsColumnsInfo, "p_data_constraints": v_changedRowsConstraintsData, "p_row_constraints_info": v_changedRowsConstraintsInfo, "p_data_indexes": v_changedRowsIndexesData, "p_row_indexes_info": v_changedRowsIndexesInfo});

	execAjax('/save_alter_table/',
			input,
			function(p_return) {

				var v_div_commands_log = document.getElementById('div_commands_log_list');
				v_div_commands_log.innerHTML = '';
				var v_commands_log = '';

				var v_has_error = false;

				v_currTabTag.btSave.style.visibility = 'hidden';

				//Creating new table
				if (p_return.v_data.v_create_table_command!=null) {

					if (!p_return.v_data.v_create_table_command.error) {
						startAlterTable('alter', v_new_table_name, v_schema_name);
						v_connTabControl.selectedTab.tag.tabControl.selectedTab.tag.tab_title_span.innerHTML = ' ' + v_schema_name + '.' + v_new_table_name;
					}
					else {
						v_has_error = true;

						v_commands_log += '<b>Command:</b> ' + p_return.v_data.v_create_table_command.v_command + '<br/><br/><b>Message:</b> ' + p_return.v_data.v_create_table_command.v_message + '<br/><br/>';

						v_currTabTag.btSave.style.visibility = 'visible';

					}
				}
				else {

					if (p_return.v_data.v_rename_table_command!=null) {

						if (!p_return.v_data.v_rename_table_command.error) {

                            v_currTabTag.alterTableObject.schemaName = v_schema_name;
							v_currTabTag.alterTableObject.tableName = v_new_table_name;
							$(v_currTabTag.txtTableName).removeClass('changed_input');
							v_connTabControl.selectedTab.tag.tabControl.selectedTab.tag.tab_title_span.innerHTML = ' ' + v_schema_name + '.' + v_new_table_name;

						}
						else {
							v_has_error = true;

							v_commands_log += '<b>Command:</b> ' + p_return.v_data.v_rename_table_command.v_command + '<br/><br/><b>Message:</b> ' + p_return.v_data.v_rename_table_command.v_message + '<br/><br/>';

							v_currTabTag.btSave.style.visibility = 'visible';

						}

					}
					else {
						$(v_currTabTag.txtTableName).removeClass('changed_input');
					}

					// New column or delete column
					for (var i = p_return.v_data.v_columns_simple_commands_return.length-1; i >= 0; i--) {

						if (p_return.v_data.v_columns_simple_commands_return[i].mode==-1) {
							if (!p_return.v_data.v_columns_simple_commands_return[i].error) {

								v_currTabTag.alterTableObject.infoRowsColumns.splice(p_return.v_data.v_columns_simple_commands_return[i].index, 1);
								v_currTabTag.alterTableObject.htColumns.alter('remove_row', p_return.v_data.v_columns_simple_commands_return[i].index);

							}
							else {

								v_has_error = true;

								v_commands_log += '<b>Command:</b> ' + p_return.v_data.v_columns_simple_commands_return[i].v_command + '<br/><br/><b>Message:</b> ' + p_return.v_data.v_columns_simple_commands_return[i].v_message + '<br/><br/>';

								v_currTabTag.btSave.style.visibility = 'visible';
							}
						}
						else if (p_return.v_data.v_columns_simple_commands_return[i].mode==2) {
							if (!p_return.v_data.v_columns_simple_commands_return[i].error) {

								v_currTabTag.alterTableObject.infoRowsColumns[p_return.v_data.v_columns_simple_commands_return[i].index].mode = 0;
								v_currTabTag.alterTableObject.infoRowsColumns[p_return.v_data.v_columns_simple_commands_return[i].index].old_mode = -1;

								v_currTabTag.alterTableObject.infoRowsColumns[p_return.v_data.v_columns_simple_commands_return[i].index].originalColName = v_currTabTag.alterTableObject.htColumns.getDataAtCell(p_return.v_data.v_columns_simple_commands_return[i].index,0);
								v_currTabTag.alterTableObject.infoRowsColumns[p_return.v_data.v_columns_simple_commands_return[i].index].originalDataType = v_currTabTag.alterTableObject.htColumns.getDataAtCell(p_return.v_data.v_columns_simple_commands_return[i].index,1);
								v_currTabTag.alterTableObject.infoRowsColumns[p_return.v_data.v_columns_simple_commands_return[i].index].originalNullable = v_currTabTag.alterTableObject.htColumns.getDataAtCell(p_return.v_data.v_columns_simple_commands_return[i].index,2);

							}
							else {

								v_has_error = true;

								v_commands_log += '<b>Command:</b> ' + p_return.v_data.v_columns_simple_commands_return[i].v_command + '<br/><br/><b>Message:</b> ' + p_return.v_data.v_columns_simple_commands_return[i].v_message  + '<br/><br/>';

								v_currTabTag.btSave.style.visibility = 'visible';
							}
						}

					}

					var v_has_group_error;

					// Altering column
					for (var i = p_return.v_data.v_columns_group_commands_return.length-1; i >= 0; i--) {

						v_has_group_error = false;

						if (p_return.v_data.v_columns_group_commands_return[i].alter_datatype!=null) {
							if (!p_return.v_data.v_columns_group_commands_return[i].alter_datatype.error) {

								v_currTabTag.alterTableObject.infoRowsColumns[p_return.v_data.v_columns_group_commands_return[i].index].originalDataType = v_currTabTag.alterTableObject.htColumns.getDataAtCell(p_return.v_data.v_columns_group_commands_return[i].index,1);

							}
							else {

								v_has_error = true;
								v_has_group_error = true;

								v_commands_log += '<b>Command:</b> ' + p_return.v_data.v_columns_group_commands_return[i].alter_datatype.v_command + '<br/><br/><b>Message:</b> ' + p_return.v_data.v_columns_group_commands_return[i].alter_datatype.v_message  + '<br/><br/>';


							}

						}

						if (p_return.v_data.v_columns_group_commands_return[i].alter_nullable!=null) {
							if (!p_return.v_data.v_columns_group_commands_return[i].alter_nullable.error) {

								v_currTabTag.alterTableObject.infoRowsColumns[p_return.v_data.v_columns_group_commands_return[i].index].originalNullable = v_currTabTag.alterTableObject.htColumns.getDataAtCell(p_return.v_data.v_columns_group_commands_return[i].index,2);

							}
							else {

								v_has_error = true;
								v_has_group_error = true;

								v_commands_log += '<b>Command:</b> ' + p_return.v_data.v_columns_group_commands_return[i].alter_nullable.v_command + '<br/><br/><b>Message:</b> ' + p_return.v_data.v_columns_group_commands_return[i].alter_nullable.v_message  + '<br/><br/>';

							}

						}

						if (p_return.v_data.v_columns_group_commands_return[i].alter_colname!=null) {
							if (!p_return.v_data.v_columns_group_commands_return[i].alter_colname.error) {

								v_currTabTag.alterTableObject.infoRowsColumns[p_return.v_data.v_columns_group_commands_return[i].index].originalColName = v_currTabTag.alterTableObject.htColumns.getDataAtCell(p_return.v_data.v_columns_group_commands_return[i].index,0);

							}
							else {

								v_has_error = true;
								v_has_group_error = true;

								v_commands_log += '<b>Command:</b> ' + p_return.v_data.v_columns_group_commands_return[i].alter_colname.v_command + '<br/><br/><b>Message:</b> ' + p_return.v_data.v_columns_group_commands_return[i].alter_colname.v_message  + '<br/><br/>';

							}

						}

						if (!v_has_group_error) {
							v_currTabTag.alterTableObject.infoRowsColumns[p_return.v_data.v_columns_group_commands_return[i].index].mode = 0;
							v_currTabTag.alterTableObject.infoRowsColumns[p_return.v_data.v_columns_group_commands_return[i].index].old_mode = -1;
						}

					}

					// New constraint or delete constraint
					for (var i = p_return.v_data.v_constraints_commands_return.length-1; i >= 0; i--) {

						if (p_return.v_data.v_constraints_commands_return[i].mode==-1) {
							if (!p_return.v_data.v_constraints_commands_return[i].error) {

								v_currTabTag.alterTableObject.infoRowsConstraints.splice(p_return.v_data.v_constraints_commands_return[i].index, 1);
								v_currTabTag.alterTableObject.htConstraints.alter('remove_row', p_return.v_data.v_constraints_commands_return[i].index);

							}
							else {

								v_has_error = true;

								v_commands_log += '<b>Command:</b> ' + p_return.v_data.v_constraints_commands_return[i].v_command + '<br/><br/><b>Message:</b> ' + p_return.v_data.v_constraints_commands_return[i].v_message + '<br/><br/>';

							}
						}
						else if (p_return.v_data.v_constraints_commands_return[i].mode==2) {
							if (!p_return.v_data.v_constraints_commands_return[i].error) {

								v_currTabTag.alterTableObject.infoRowsConstraints[p_return.v_data.v_constraints_commands_return[i].index].mode = 0;
								v_currTabTag.alterTableObject.infoRowsConstraints[p_return.v_data.v_constraints_commands_return[i].index].old_mode = -1;

							}
							else {

								v_has_error = true;

								v_commands_log += '<b>Command:</b> ' + p_return.v_data.v_constraints_commands_return[i].v_command + '<br/><br/><b>Message:</b> ' + p_return.v_data.v_constraints_commands_return[i].v_message  + '<br/><br/>';

							}
						}

					}

					// New index or delete index
					for (var i = p_return.v_data.v_indexes_commands_return.length-1; i >= 0; i--) {

						if (p_return.v_data.v_indexes_commands_return[i].mode==-1) {
							if (!p_return.v_data.v_indexes_commands_return[i].error) {

								v_currTabTag.alterTableObject.infoRowsIndexes.splice(p_return.v_data.v_indexes_commands_return[i].index, 1);
								v_currTabTag.alterTableObject.htIndexes.alter('remove_row', p_return.v_data.v_indexes_commands_return[i].index);

							}
							else {

								v_has_error = true;

								v_commands_log += '<b>Command:</b> ' + p_return.v_data.v_indexes_commands_return[i].v_command + '<br/><br/><b>Message:</b> ' + p_return.v_data.v_indexes_commands_return[i].v_message + '<br/><br/>';

							}
						}
						else if (p_return.v_data.v_indexes_commands_return[i].mode==2) {
							if (!p_return.v_data.v_indexes_commands_return[i].error) {

								v_currTabTag.alterTableObject.infoRowsIndexes[p_return.v_data.v_indexes_commands_return[i].index].mode = 0;
								v_currTabTag.alterTableObject.infoRowsIndexes[p_return.v_data.v_indexes_commands_return[i].index].old_mode = -1;

							}
							else {

								v_has_error = true;

								v_commands_log += '<b>Command:</b> ' + p_return.v_data.v_indexes_commands_return[i].v_command + '<br/><br/><b>Message:</b> ' + p_return.v_data.v_indexes_commands_return[i].v_message  + '<br/><br/>';

							}
						}

					}
				}

				if (v_has_error) {
					v_div_commands_log.innerHTML = v_commands_log;
					$('#div_commands_log').show();

				}
				else {
					v_currTabTag.btSave.style.visibility = 'hidden';
				}

				v_currTabTag.alterTableObject.htColumns.render();
				v_currTabTag.alterTableObject.htConstraints.render();
				v_currTabTag.alterTableObject.htIndexes.render();

			},
			null,
			'box');

}

/// <summary>
/// Changes table name.
/// </summary>
function changeTableName() {

	var v_curr_tab_tag = v_connTabControl.selectedTab.tag.tabControl.selectedTab.tag;

	v_curr_tab_tag.btSave.style.visibility = 'visible';
	$(v_curr_tab_tag.txtTableName).addClass('changed_input');

}

/// <summary>
/// Changes sequence field.
/// </summary>
function changeSequenceField(p_element) {

	var v_curr_tab_tag = v_connTabControl.selectedTab.tag.tabControl.selectedTab.tag;

	v_curr_tab_tag.btSave.style.visibility = 'visible';
	$(p_element).addClass('changed_input');

}

/// <summary>
/// Triggered when X is pressed in specific column at the alter table window.
/// </summary>
function dropColumnAlterTable() {

	var v_currTabTag = v_connTabControl.selectedTab.tag.tabControl.selectedTab.tag;

	var v_data = v_currTabTag.alterTableObject.htColumns.getData();
	var v_row = v_currTabTag.alterTableObject.htColumns.getSelected()[0];

	if (v_currTabTag.alterTableObject.infoRowsColumns[v_row].mode==2) {

		v_currTabTag.alterTableObject.infoRowsColumns.splice(v_row,1);
		v_data.splice(v_row,1);

		v_currTabTag.alterTableObject.htColumns.loadData(v_data);

	}
	else {

		var v_mode = v_currTabTag.alterTableObject.infoRowsColumns[v_row].mode;
		v_currTabTag.alterTableObject.infoRowsColumns[v_row].mode = v_currTabTag.alterTableObject.infoRowsColumns[v_row].old_mode;
		v_currTabTag.alterTableObject.infoRowsColumns[v_row].old_mode = v_mode;

		v_currTabTag.alterTableObject.htColumns.loadData(v_data);

	}

	v_currTabTag.btSave.style.visibility = 'visible';

}

/// <summary>
/// Triggered when X is pressed in specific constraint at the alter table window.
/// </summary>
function dropConstraintAlterTable() {

	var v_currTabTag = v_connTabControl.selectedTab.tag.tabControl.selectedTab.tag;

	var v_data = v_currTabTag.alterTableObject.htConstraints.getData();
	var v_row = v_currTabTag.alterTableObject.htConstraints.getSelected()[0];

	if (v_currTabTag.alterTableObject.infoRowsConstraints[v_row].mode==2) {

		v_currTabTag.alterTableObject.infoRowsConstraints.splice(v_row,1);
		v_data.splice(v_row,1);

		v_currTabTag.alterTableObject.htConstraints.loadData(v_data);

	}
	else {

		var v_mode = v_currTabTag.alterTableObject.infoRowsConstraints[v_row].mode;
		v_currTabTag.alterTableObject.infoRowsConstraints[v_row].mode = v_currTabTag.alterTableObject.infoRowsConstraints[v_row].old_mode;
		v_currTabTag.alterTableObject.infoRowsConstraints[v_row].old_mode = v_mode;

		v_currTabTag.alterTableObject.htConstraints.loadData(v_data);

	}

	v_currTabTag.btSave.style.visibility = 'visible';

}

/// <summary>
/// Triggered when X is pressed in specific index at the alter table window.
/// </summary>
function dropIndexAlterTable() {

	var v_currTabTag = v_connTabControl.selectedTab.tag.tabControl.selectedTab.tag;

	var v_data = v_currTabTag.alterTableObject.htIndexes.getData();
	var v_row = v_currTabTag.alterTableObject.htIndexes.getSelected()[0];

	if (v_currTabTag.alterTableObject.infoRowsIndexes[v_row].mode==2) {

		v_currTabTag.alterTableObject.infoRowsIndexes.splice(v_row,1);
		v_data.splice(v_row,1);

		v_currTabTag.alterTableObject.htIndexes.loadData(v_data);

	}
	else {

		var v_mode = v_currTabTag.alterTableObject.infoRowsIndexes[v_row].mode;
		v_currTabTag.alterTableObject.infoRowsIndexes[v_row].mode = v_currTabTag.alterTableObject.infoRowsIndexes[v_row].old_mode;
		v_currTabTag.alterTableObject.infoRowsIndexes[v_row].old_mode = v_mode;

		v_currTabTag.alterTableObject.htIndexes.loadData(v_data);

	}

	v_currTabTag.btSave.style.visibility = 'visible';

}

/// <summary>
/// Adds new column at the alter table window.
/// </summary>
function newColumnAlterTable() {

	var v_currTabTag = v_connTabControl.selectedTab.tag.tabControl.selectedTab.tag;

	var v_data = v_currTabTag.alterTableObject.htColumns.getData();

	var v_object = new Object();
	v_object.canAlterType = true;
	v_object.canAlterNullable = true;
	v_object.canRenameColumn = true;
	v_object.mode = 2;
	v_object.originalColName = '';
	v_object.originalDataType = '';
	v_object.nullable = '';

	v_currTabTag.alterTableObject.infoRowsColumns.push(v_object);

	v_data.push(['','','YES','<img src="/static/OmniDB_app/images/tab_close.png" onclick="dropColumnAlterTable()"/>']);

	v_currTabTag.alterTableObject.htColumns.loadData(v_data);

	v_currTabTag.btSave.style.visibility = 'visible';

}

/// <summary>
/// Adds new index at the alter table window.
/// </summary>
function newIndexAlterTable() {

	var v_currTabTag = v_connTabControl.selectedTab.tag.tabControl.selectedTab.tag;

	var v_data = v_currTabTag.alterTableObject.htIndexes.getData();

	var v_object = new Object();
	v_object.mode = 2;
	v_object.old_mode = 2;
	v_object.index = v_currTabTag.alterTableObject.infoRowsIndexes.length;


	v_currTabTag.alterTableObject.infoRowsIndexes.push(v_object);

	v_data.push(['','',"<img src='/static/OmniDB_app/images/edit_columns.png' class='img_ht' onclick='showColumnSelectionIndexes()'/> ",'<img src="/static/OmniDB_app/images/tab_close.png" onclick="dropIndexAlterTable()"/>']);

	v_currTabTag.alterTableObject.htIndexes.loadData(v_data);

	v_currTabTag.btSave.style.visibility = 'visible';

}

/// <summary>
/// Adds new constraint at the alter table window.
/// </summary>
function newConstraintAlterTable() {

	var v_currTabTag = v_connTabControl.selectedTab.tag.tabControl.selectedTab.tag;

	var v_data = v_currTabTag.alterTableObject.htConstraints.getData();

	var v_object = new Object();
	v_object.mode = 2;
	v_object.old_mode = 2;
	v_object.index = v_currTabTag.alterTableObject.infoRowsConstraints.length;


	v_currTabTag.alterTableObject.infoRowsConstraints.push(v_object);

	v_data.push(['','',"<img src='/static/OmniDB_app/images/edit_columns.png' class='img_ht' onclick='showColumnSelectionConstraints()'/> ",'','','','','<img src="/static/OmniDB_app/images/tab_close.png" onclick="dropConstraintAlterTable()"/>']);

	v_currTabTag.alterTableObject.htConstraints.loadData(v_data);

	v_currTabTag.btSave.style.visibility = 'visible';

}

/// <summary>
/// Adds column to right list at columns list window.
/// </summary>
function addColumnToList() {

	var v_select_left = document.getElementById("sel_columns_left");

	var v_select_right = document.getElementById("sel_columns_right");
	var option = document.createElement("option");
	option.text = v_select_left.options[v_select_left.selectedIndex].text;
	v_select_right.add(option);

	v_select_left.remove(v_select_left.selectedIndex);

}

/// <summary>
/// Adds column to left list at columns list window.
/// </summary>
function remColumnFromList() {

	var v_select_right = document.getElementById("sel_columns_right");

	var v_select_left = document.getElementById("sel_columns_left");
	var option = document.createElement("option");
	option.text = v_select_right.options[v_select_right.selectedIndex].text;
	v_select_left.add(option);

	v_select_right.remove(v_select_right.selectedIndex);

}

/// <summary>
/// Hides column list window.
/// </summary>
function hideColumnSelection() {

	var v_currTabTag = v_connTabControl.selectedTab.tag.tabControl.selectedTab.tag;

	var v_select_right = document.getElementById('sel_columns_right');

	var v_first = true;
	var v_column_string = '';

	for (var i=0; i < v_select_right.options.length; i++) {
		if (!v_first)
			v_column_string += ', ';

		v_first = false;
		v_column_string += v_select_right.options[i].text;

	}

	if (v_currTabTag.alterTableObject.window=='constraints') {
		v_column_string = "<img src='/static/OmniDB_app/images/edit_columns.png' class='img_ht' onclick='showColumnSelectionConstraints()'/> " + v_column_string;
		v_currTabTag.alterTableObject.htConstraints.setDataAtCell(v_currTabTag.alterTableObject.selectedConstraintRow, 2, v_column_string);
	}
	else {
		v_column_string = "<img src='/static/OmniDB_app/images/edit_columns.png' class='img_ht' onclick='showColumnSelectionIndexes()'/> " + v_column_string;
		v_currTabTag.alterTableObject.htIndexes.setDataAtCell(v_currTabTag.alterTableObject.selectedIndexRow, 2, v_column_string);
	}
	$('#div_column_selection').hide();

}

/// <summary>
/// Displays columns list window for constraints.
/// </summary>
function showColumnSelectionConstraints() {

	var v_currTabTag = v_connTabControl.selectedTab.tag.tabControl.selectedTab.tag;

	$("#sel_columns_left").empty();
	$("#sel_columns_right").empty();

	var v_select_left = document.getElementById('sel_columns_left');
	var v_select_right = document.getElementById('sel_columns_right');

	var v_selected = v_currTabTag.alterTableObject.htConstraints.getSelected();

	if (v_currTabTag.alterTableObject.infoRowsConstraints[v_selected[0]].mode==2) {

		v_currTabTag.alterTableObject.selectedConstraintRow = v_selected[0];

		var v_type = v_currTabTag.alterTableObject.htConstraints.getDataAtCell(v_selected[0],1);

		if (v_type=='Primary Key' || v_type=='Foreign Key' || v_type=='Unique') {

			var v_columns = v_currTabTag.alterTableObject.htConstraints.getDataAtCell(v_selected[0],v_selected[1]);
			v_columns = v_columns.substring(114);

			var v_constraint_columns_list;

			if (v_columns=='')
				v_constraint_columns_list = [];
			else
				v_constraint_columns_list = v_columns.split(', ')

			for (var i=0; i < v_constraint_columns_list.length; i++) {
				var option = document.createElement("option");
				option.text = v_constraint_columns_list[i];
				v_select_right.add(option);
			}

			var v_table_columns_list = v_currTabTag.alterTableObject.htColumns.getDataAtCol(0);

			for (var i=0; i < v_table_columns_list.length-1; i++) {
				if (v_constraint_columns_list.indexOf(v_table_columns_list[i])==-1) {
					var option = document.createElement("option");
					option.text = v_table_columns_list[i];
					v_select_left.add(option);
				}
			}

			$('#div_column_selection').show();

		}

	}

}

/// <summary>
/// Displays columns list window for indexes.
/// </summary>
function showColumnSelectionIndexes() {

	var v_currTabTag = v_connTabControl.selectedTab.tag.tabControl.selectedTab.tag;

	$("#sel_columns_left").empty();
	$("#sel_columns_right").empty();

	var v_select_left = document.getElementById('sel_columns_left');
	var v_select_right = document.getElementById('sel_columns_right');

	var v_selected = v_currTabTag.alterTableObject.htIndexes.getSelected();

	if (v_currTabTag.alterTableObject.infoRowsIndexes[v_selected[0]].mode==2) {

		v_currTabTag.alterTableObject.selectedIndexRow = v_selected[0];

		var v_type = v_currTabTag.alterTableObject.htIndexes.getDataAtCell(v_selected[0],1);


		var v_columns = v_currTabTag.alterTableObject.htIndexes.getDataAtCell(v_selected[0],v_selected[1]);
		v_columns = v_columns.substring(110);

		var v_index_columns_list;

		if (v_columns=='')
			v_index_columns_list = [];
		else
			v_index_columns_list = v_columns.split(', ')

		for (var i=0; i < v_index_columns_list.length; i++) {
			var option = document.createElement("option");
			option.text = v_index_columns_list[i];
			v_select_right.add(option);
		}

		var v_table_columns_list = v_currTabTag.alterTableObject.htColumns.getDataAtCol(0);

		for (var i=0; i < v_table_columns_list.length-1; i++) {
			if (v_index_columns_list.indexOf(v_table_columns_list[i])==-1) {
				var option = document.createElement("option");
				option.text = v_table_columns_list[i];
				v_select_left.add(option);
			}
		}

		$('#div_column_selection').show();

	}

}
