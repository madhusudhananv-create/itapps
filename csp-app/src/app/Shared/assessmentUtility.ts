import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ChartsService } from '../Services/charts.service';
import { AppServiceOthers } from '../Services/apps.service.other';
import { MatDialog } from '@angular/material';

@Injectable()
export class assessmentUtility {

    constructor(private _router: Router, private _chartsService: ChartsService, private _otherServices: AppServiceOthers, private matDialog: MatDialog) {

    }

    //Service Area
    public getServiceAreaMaturityLevel(maturityLevelMappings, percentage) {
        let maturityLevelScaleRec;
        if (percentage && maturityLevelMappings && maturityLevelMappings.length > 0) {
            maturityLevelScaleRec = maturityLevelMappings.find(x => percentage >= x.loweR_BOUND_SCORE && percentage <= x.uppeR_BOUND_SCORE);
            if (maturityLevelScaleRec != undefined)
                return maturityLevelScaleRec.leveL_TITLE;
        }

        return '';
    }

    public getServiceAreaScore(serviceArea) {
        if (serviceArea != undefined) {
            serviceArea.scorE_ACHIEVED = 0;
            serviceArea.updateD_SCORE = 0;
            for (var processModel of serviceArea.checkpointS_BY_PROCESS_MODEL) {
                for (var processArea of processModel.checkpointS_BY_PROCESS_AREA) {
                    for (var process of processArea.checkpointS_BY_PROCESS) {
                        for (var checkpoint of process.checkpoints) {
                            if (checkpoint.statuS_CATEGORY && checkpoint.statuS_CATEGORY != null && checkpoint.statuS_CATEGORY != 'N/A') {
                                serviceArea.scorE_ACHIEVED += checkpoint.score;
                            }
                        }
                    }
                }
            }
        }
        else
            serviceArea.scorE_ACHIEVED = 0;
        return serviceArea.scorE_ACHIEVED;
    }

    public getServiceAreaMaxScore(maxMultiplier, checklistStatusValues, hideweightage, serviceArea) {
        let maxScore = 0;
        let questionsCount = 0;

        if (!serviceArea)
            return 0;

        maxMultiplier = Math.max(...checklistStatusValues.map(x => x.multiplier), 0);

        for (var processModel of serviceArea.checkpointS_BY_PROCESS_MODEL)
            for (var processArea of processModel.checkpointS_BY_PROCESS_AREA)
                for (var process of processArea.checkpointS_BY_PROCESS) {
                    questionsCount += process.checkpoints.filter(x => x.statuS_CATEGORY != 'N/A').length;
                    for (var checkpoint of process.checkpoints)
                        if (checkpoint.statuS_CATEGORY != 'N/A')
                            maxScore += (checkpoint.weightagE_SCORE) * maxMultiplier;
                }

        if (!hideweightage)
            serviceArea.maX_SCORE = maxScore;
        else
            serviceArea.maX_SCORE = questionsCount * maxMultiplier;

        return serviceArea.maX_SCORE;
    }

    public getServiceAreaPercentage(serviceArea) {
        if (parseFloat(serviceArea.maX_SCORE.toString()) > 0)
            serviceArea.percentage = +((parseFloat(serviceArea.scorE_ACHIEVED.toString()) / parseFloat(serviceArea.maX_SCORE.toString()) * 100).toFixed(2));
        else
            serviceArea.percentage = 100;

        return serviceArea.percentage;
    }

    public getServiceAreaUpdatedScore(serviceArea) {
        if (serviceArea != undefined) {
            serviceArea.updateD_SCORE = 0;
            for (var processModel of serviceArea.checkpointS_BY_PROCESS_MODEL) {
                for (var processArea of processModel.checkpointS_BY_PROCESS_AREA) {
                    for (var process of processArea.checkpointS_BY_PROCESS) {
                        for (var checkpoint of process.checkpoints) {
                            if (checkpoint.statuS_CATEGORY && checkpoint.statuS_CATEGORY != null && checkpoint.statuS_CATEGORY != 'N/A') {
                                serviceArea.updateD_SCORE += checkpoint.updateD_SCORE;
                            }
                        }
                    }
                }
            }
        }
        else
            serviceArea.updateD_SCORE = 0;
        return serviceArea.updateD_SCORE;
    }

    public getServiceAreaUpdatedPercentage(serviceArea) {
        if (parseFloat(serviceArea.maX_SCORE.toString()) > 0)
            serviceArea.percentage = +((parseFloat(serviceArea.updateD_SCORE.toString()) / parseFloat(serviceArea.maX_SCORE.toString()) * 100).toFixed(2));
        else
            serviceArea.percentage = 100;

        return serviceArea.percentage;
    }

    //Process Model
    public getProcessModelMaturityLevel(maturityLevelMappings, percentage) {
        let maturityLevelScaleRec;
        if (percentage && maturityLevelMappings && maturityLevelMappings.length > 0) {
            maturityLevelScaleRec = maturityLevelMappings.find(x => percentage >= x.loweR_BOUND_SCORE && percentage <= x.uppeR_BOUND_SCORE);
            if (maturityLevelScaleRec != undefined)
                return maturityLevelScaleRec.leveL_TITLE;
        }

        return '';
    }

    public getProcessModelScore(processModel) {
        if (processModel != undefined) {
            processModel.scorE_ACHIEVED = 0;
            for (var processArea of processModel.checkpointS_BY_PROCESS_AREA) {
                for (var process of processArea.checkpointS_BY_PROCESS) {
                    for (var checkpoint of process.checkpoints) {
                        if (checkpoint.statuS_CATEGORY && checkpoint.statuS_CATEGORY != null && checkpoint.statuS_CATEGORY != 'N/A')
                            processModel.scorE_ACHIEVED += checkpoint.score;
                    }
                }
            }
        }
        else
            processModel.scorE_ACHIEVED = 0;
        return processModel.scorE_ACHIEVED;
    }

    public getProcessModelMaxScore(processModel, maxMultiplier, checklistStatusValues, hideweightage) {
        let maxScore = 0;
        let questionsCount = 0;

        if (!processModel)
            return 0;

        maxMultiplier = Math.max(...checklistStatusValues.map(x => x.multiplier), 0);

        for (var processArea of processModel.checkpointS_BY_PROCESS_AREA)
            for (var process of processArea.checkpointS_BY_PROCESS) {
                questionsCount += process.checkpoints.filter(x => x.statuS_CATEGORY != 'N/A').length;
                for (var checkpoint of process.checkpoints)
                    if (checkpoint.statuS_CATEGORY != 'N/A')
                        maxScore += (checkpoint.weightagE_SCORE) * maxMultiplier;
            }

        if (!hideweightage)
            processModel.maX_SCORE = maxScore;
        else
            processModel.maX_SCORE = questionsCount * maxMultiplier;

        return processModel.maX_SCORE;
    }

    public getProcessModelPercentage(processModel) {
        if (parseFloat(processModel.maX_SCORE.toString()) > 0)
            processModel.percentage = +((parseFloat(processModel.scorE_ACHIEVED.toString()) / parseFloat(processModel.maX_SCORE.toString()) * 100).toFixed(2));
        else
            processModel.percentage = 100;

        return processModel.percentage;
    }

    public getProcessModelUpdatedScore(processModel) {
        if (processModel != undefined) {
            processModel.updateD_SCORE = 0;
            for (var processArea of processModel.checkpointS_BY_PROCESS_AREA) {
                for (var process of processArea.checkpointS_BY_PROCESS) {
                    for (var checkpoint of process.checkpoints) {
                        if (checkpoint.statuS_CATEGORY && checkpoint.statuS_CATEGORY != null && checkpoint.statuS_CATEGORY != 'N/A')
                            processModel.updateD_SCORE += checkpoint.updateD_SCORE;
                    }
                }
            }
        }
        else
            processModel.updateD_SCORE = 0;
        return processModel.updateD_SCORE;
    }

    public getProcessModelUpdatedPercentage(processModel) {
        if (parseFloat(processModel.maX_SCORE.toString()) > 0)
            processModel.percentage = +((parseFloat(processModel.updateD_SCORE.toString()) / parseFloat(processModel.maX_SCORE.toString()) * 100).toFixed(2));
        else
            processModel.percentage = 100;

        return processModel.percentage;
    }

    public getProcessAreaMaturityLevel(percentage, maturityLevelMappings) {
        let maturityLevelScaleRec;
        if (percentage && maturityLevelMappings && maturityLevelMappings.length > 0) {
            maturityLevelScaleRec = maturityLevelMappings.find(x => percentage >= x.loweR_BOUND_SCORE && percentage <= x.uppeR_BOUND_SCORE);
            if (maturityLevelScaleRec != undefined)
                return maturityLevelScaleRec.leveL_TITLE;
        }

        return '';
    }

    public getProcessAreaScore(parea) {
        parea.scorE_ACHIEVED = 0;
        if (parea != undefined) {
            for (var process of parea.checkpointS_BY_PROCESS) {
                parea.scorE_ACHIEVED += process.checkpoints.filter(x => x.statuS_CATEGORY != 'N/A').map(x => x.score).reduce((x, y) => {
                    return (x + y)
                }, 0)
            }
        }

        return parea.scorE_ACHIEVED;
    }

    getProcessAreaMaxScore(processArea, maxMultiplier, checklistStatusValues, hideweightage) {
        let questionsCount = 0;
        processArea.maX_SCORE = 0;

        maxMultiplier = Math.max(...checklistStatusValues.map(x => x.multiplier), 0);
        if (processArea != undefined) {
            for (var process of processArea.checkpointS_BY_PROCESS) {
                questionsCount += process.checkpoints.filter(x => x.statuS_CATEGORY != 'N/A').length;
            }

            if (!hideweightage) {
                processArea.checkpointS_BY_PROCESS.forEach((process) => {
                    process.checkpoints.forEach((question) => {
                        if (question.statuS_CATEGORY == "N/A") return;
                        processArea.maX_SCORE += (question.weightagE_SCORE) * maxMultiplier;
                    });
                })
            }
            else
                processArea.maX_SCORE = questionsCount * maxMultiplier;
        }

        return processArea.maX_SCORE;
    }

    public getProcessAreaPercentage(processArea) {
        try {
            if (parseFloat(processArea.maX_SCORE.toString()) > 0)
                processArea.percentage = +((parseFloat(processArea.scorE_ACHIEVED.toString()) / parseFloat(processArea.maX_SCORE.toString()) * 100).toFixed(2));
            else
                processArea.percentage = 100;

            return processArea.percentage;
        }
        catch (e) {
            alert('There is an error in calculating Process area percentage');
        }
    }

    public getProcessAreaUpdatedScore(parea) {
        parea.updateD_SCORE = 0;
        if (parea != undefined) {
            for (var process of parea.checkpointS_BY_PROCESS) {
                parea.updateD_SCORE += process.checkpoints.filter(x => x.statuS_CATEGORY != 'N/A').map(x => x.updateD_SCORE).reduce((x, y) => {
                    return (x + y)
                }, 0)
            }
        }

        return parea.updateD_SCORE;
    }

    public getProcessAreaUpdatedercentage(processArea) {
        try {
            if (parseFloat(processArea.maX_SCORE.toString()) > 0)
                processArea.percentage = +((parseFloat(processArea.updateD_SCORE.toString()) / parseFloat(processArea.maX_SCORE.toString()) * 100).toFixed(2));
            else
                processArea.percentage = 100;

            return processArea.percentage;
        }
        catch (e) {
            alert('There is an error in calculating Process area percentage');
        }
    }

    //Process
    public getProcessScore(process) {
        if (process != undefined && process.checkpoints != undefined) {
            process.scorE_ACHIEVED = process.checkpoints.filter(x => x.statuS_CATEGORY != 'N/A').map(x => x.score).reduce((x, y) => {
                return (x + y)
            }, 0)
        }
        else
            process.scorE_ACHIEVED = 0;

        return process.scorE_ACHIEVED;
    }

    public getProcessMaxScore(process, maxMultiplier, checklistStatusValues, hideweightage) {
        let maxScore = 0;

        if (!process || !process.checkpoints || process.checkpoints.length === 0)
            return 0;

        maxMultiplier = Math.max(...checklistStatusValues.map(x => x.multiplier), 0);
        process.maX_SCORE = 0;

        if (!hideweightage)
            process.checkpoints.forEach((question) => {
                if (question.statuS_CATEGORY == "N/A")
                    return;

                process.maX_SCORE += (question.weightagE_SCORE) * maxMultiplier;
            });
        else
            process.maX_SCORE = maxMultiplier * process.checkpoints.filter(x => x.statuS_CATEGORY != 'N/A').length;

        return process.maX_SCORE;
    }

    public getProcessPercentage(process) {
        if (parseFloat(process.maX_SCORE.toString()) > 0)
            process.percentage = +((parseFloat(process.scorE_ACHIEVED.toString()) / parseFloat(process.maX_SCORE.toString()) * 100).toFixed(2));
        else
            process.percentage = 100;

        return process.percentage;
    }

    public getProcessUpdatedScore(process) {
        process.updateD_SCORE = 0;
        if (process != undefined && process.checkpoints != undefined) {
            process.updateD_SCORE = process.checkpoints.filter(x => x.statuS_CATEGORY != 'N/A').map(x => x.updateD_SCORE).reduce((x, y) => {
                return (x + y)
            }, 0)
        }
        else
            process.updateD_SCORE = 0;

        return process.updateD_SCORE;
    }

    public getProcessUpdatedPercentage(process) {
        if (parseFloat(process.maX_SCORE.toString()) > 0)
            process.percentage = +((parseFloat(process.updateD_SCORE.toString()) / parseFloat(process.maX_SCORE.toString()) * 100).toFixed(2));
        else
            process.percentage = 100;

        return process.percentage;
    }

}