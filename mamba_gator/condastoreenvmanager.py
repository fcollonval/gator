# Copyright (c) 2016-2020 Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.
import asyncio
import collections
import json
import logging
import os
import re
import sys
import tempfile
from functools import partial, lru_cache
from pathlib import Path
from subprocess import PIPE, Popen
from typing import Any, Dict, List, Optional, Tuple, Union

import tornado
from jupyter_client.kernelspec import KernelSpecManager

from packaging.version import parse

from .log import get_logger
from jupyter_server.utils import url2path, url_path_join

import requests
from urllib.parse import urljoin

class CondaStoreEnvManager:
    """Handles environment and package actions, interfacing with Conda Store's REST API."""

    _conda_version: Optional[str] = None
    _mamba_version: Optional[str] = None
    _manager_exe: Optional[str] = None

    def __init__(self, api_url: str):
        """
        Args:
            api_url (str): url to the Conda Store REST API, like : http://localhost:5000/conda-store/api/v1/
        """
        self._api_url = api_url
        
    '''
    def _clean_conda_json(self, output: str) -> Dict[str, Any]:
        """Clean a command output to fit json format.

        Args:
            output (str): output to clean

        Returns:
            Dict[str, Any]: Cleaned output
        """
        lines = output.splitlines()

        try:
            return json.loads("\n".join(lines))
        except (ValueError, json.JSONDecodeError) as err:
            self.log.warn("JSON parse fail:\n{!s}".format(err))

        # try to remove bad lines
        lines = [line for line in lines if re.match(JSONISH_RE, line)]

        try:
            return json.loads("\n".join(lines))
        except (ValueError, json.JSONDecodeError) as err:
            self.log.error("JSON clean/parse fail:\n{!s}".format(err))

        return {"error": True}

    async def _execute(self, cmd: str, *args) -> Tuple[int, str]:
        """Asynchronously execute a command.

        Args:
            cmd (str): command to execute
            *args: additional command arguments

        Returns:
            (int, str): (return code, output) or (return code, error)
        """
        cmdline = [cmd]
        cmdline.extend(args)

        self.log.debug("command: {!s}".format(" ".join(cmdline)))

        current_loop = tornado.ioloop.IOLoop.current()
        process = await current_loop.run_in_executor(
            None, partial(Popen, cmdline, stdout=PIPE, stderr=PIPE)
        )
        try:
            output, error = await current_loop.run_in_executor(
                None, process.communicate
            )
        except asyncio.CancelledError:
            process.terminate()
            await current_loop.run_in_executor(None, process.wait)
            raise

        returncode = process.returncode
        if returncode == 0:
            output = output.decode("utf-8")
        else:
            self.log.debug("exit code: {!s}".format(returncode))
            output = error.decode("utf-8") + output.decode("utf-8")

        self.log.debug("output: {!s}".format(output[:MAX_LOG_OUTPUT]))

        if len(output) > MAX_LOG_OUTPUT:
            self.log.debug("...")

        return returncode, output
        '''

    @property
    def log(self) -> logging.Logger:
        """logging.Logger : Extension logger"""
        return get_logger()


    # async def info(self) -> Dict[str, Any]:
    #     """Returns `conda info --json` execution.

    #     Returns:
    #         The dictionary of conda information
    #     """
    #     ans = await self._execute(self.manager, "info", "--json")
    #     rcode, output = ans
    #     info = self._clean_conda_json(output)
    #     if rcode == 0:
    #         EnvManager._conda_version = tuple(
    #             map(
    #                 lambda part: int(part),
    #                 info.get("conda_version", EnvManager._conda_version).split("."),
    #             )
    #         )
    #     return info

    async def list_envs(self) -> Dict[str, List[Dict[str, Union[str, bool]]]]:
        """List all environments available in Conda Store

            
        An environment is described by a dictionary:
        {
            name (str): environment name,
            dir (str): environment prefix,
            is_default (bool): is the root environment
        }

        Returns:
            {"environments": List[env]}: The environments
        """
        
        api_endpoint = urljoin(self._api_url, "environment/" )
        
        req = requests.get(api_endpoint)
        
        if req.status_code != 200:
            #TODO improve error handling
            print("ERROR : ", req.status_code)
            return {'error':req.status_code}

        envs_list = []
        for raw_env in req.json():
            new_env = {'name':raw_env['name'], 
                       'dir':'',
                       'is_default':False
                       }
            envs_list.append(  new_env )

        

        return {"environments": envs_list}



    # stub for POC
    async def env_channels(
        self, configuration: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Dict[str, List[str]]]:
        """List available channels.

        Args:
            configuration (Dict[str, Any] or None): Conda configuration

        Returns:
            {"channels": {<channel>: <uri>}}
        """
        
        return {"channels": []}



    # stub for POC    
    async def list_available(self) -> Dict[str, List[Dict[str, str]]]:
        """List all available packages

        Returns:
            {
                "packages": List[package],
                "with_description": bool  # Whether we succeed in get some channeldata.json files
            }
        """
        
        return {
            "packages": [],
            "with_description": False,
        }

